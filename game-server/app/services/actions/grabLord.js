/**
 * Created by edwardzhou on 13-11-27.
 */

var utils = require('../../util/utils');
var GameState = require('../../consts/consts').GameState;
var ErrorCode = require('../../consts/errorCode');
var CardUtil = require('../../util/cardUtil');

var GrabLordAction = function() {

};

module.exports = GrabLordAction;

/**
 * 排序比较函数
 * @param p1
 * @param p2
 * @returns {number}
 * @private
 */
var _sortPokeCard = function(p1, p2) {
  return p1.pokeIndex - p2.pokeIndex;
};



/**
 * 处理叫地主逻辑
 * @param gameTable
 * @param player
 * @param lordAction
 * @param cb
 */
GrabLordAction.doGrabLord = function(gameTable, player, lordAction, cb) {
  var table = gameTable;
  var pokeGame = table.pokeGame;
//  // 必须是轮到叫地主的玩家(table.nextUserId == player.userId)才能叫
//  if (pokeGame.token.nextUserId != player.userId) {
//    // 不是轮到当前玩家叫地主，返回错误
//    utils.invokeCallback(cb, {err: ErrorCode.NOT_IN_TURN}, null);
//    return;
//  }

  // 所叫的分数必须大于当前地主分
//  if (lordAction > 0 && lordAction <= pokeGame.grabbingLord.lordValue) {
//    utils.invokeCallback(cb, {err: ErrorCode.INVALID_GRAB_LORD_VALUE}, null);
//    return;
//  }

  pokeGame.grabbingLord.grabTimes ++;

  if (lordAction > 0) {
    // 更新有效地主分
    if (pokeGame.grabbingLord.lordValue == 0) {
      pokeGame.grabbingLord
    }

    pokeGame.grabbingLord.lordValue = pokeGame.grabbingLord.lordValue * 2;
    pokeGame.grabbingLord.lastUserId = player.userId;
  }
  var msgBack = {};

  // 如果叫3分，则该玩家为地主，并结束抢地主环节。
  if (lordAction == 3) {
    // 指定玩家为地主, 并把地主牌通知个所有人
    pokeGame.lordUserId = player.userId;
    pokeGame.lordValue = pokeGame.grabbingLord.lordValue;
    pokeGame.state = GameState.PLAYING;
    pokeGame.token.nextUserId = player.userId;

    var pokeCards = player.pokeCards.concat(table.lordPokeCards).sort(_sortPokeCard);
    // 玩家获得地主牌
    player.setPokeCards(pokeCards);

    // 返回信息
    msgBack = {
      lordValue: pokeGame.lordValue,
      lordUserId: player.userId,
      nextUserId: player.userId,
      lordPokeCards: CardUtil.pokeCardsToString(table.lordPokeCards)
    };
  } else if (pokeGame.grabbingLord.grabTimes < 3) {
    // 未产生地主，通知
    var index = pokeGame.players.indexOf(player);
    var nextIndex = (index+1) % pokeGame.players.length;
    var nextPlayer = pokeGame.players[nextIndex];

    pokeGame.nextUserId = nextPlayer.userId;
    pokeGame.token.nextUserId = nextPlayer.userId;

    msgBack = {
      lordValue: lordAction,
      lastUserId: player.userId,
      nextUserId: pokeGame.nextUserId
    };
  } else {
    // 已经叫过3次地主，但没有一个叫3分，找出最高分的为地主，
    // 或如果都不叫，则流局
    if (pokeGame.grabbingLord.lordValue == 0) {
      // 都不叫，流局
      table.reset();
      msgBack = {
      };
    } else {
      // 叫分最高的玩家为地主
      pokeGame.lordUserId = pokeGame.grabbingLord.lastUserId;
      pokeGame.lordValue = pokeGame.grabbingLord.lordValue;
      pokeGame.state = GameState.PLAYING;

      var lordPlayer = pokeGame.getPlayerByUserId(pokeGame.lordUserId);

      var pokeCards = lordPlayer.pokeCards.concat(table.lordPokeCards).sort(_sortPokeCard);
      // 玩家获得地主牌
      lordPlayer.setPokeCards(pokeCards);

      // 返回信息
      msgBack = {
        lordValue: pokeGame.lordValue,
        lordUserId: pokeGame.lordUserId,
        nextUserId: pokeGame.lordUserId,
        lordPokeCards: pokeGame.lordCards
      };

    }
  }

  utils.invokeCallback(cb, null, msgBack);
};