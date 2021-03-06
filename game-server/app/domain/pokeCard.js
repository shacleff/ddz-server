/**
 * Copyright (c) 2015 深圳市辉游科技有限公司.
 */

var format = require('util').format;
var mess = require('mess');
var utils = require('../util/utils');
var PokeCardValue = require('../consts/consts').PokeCardValue;
var PokeCardString = require('../consts/consts').PokeCardString;

var allPokeCards = [];
var allPokeCardsMap = {};
var allPokeCardsCharMap = {};
//var allPokeCardsIdCharMap = {};

var PokeCard = function(opts) {
  opts = opts || {};
  this.value = opts.value || PokeCardValue.NONE;
  this.id = opts.id;
  this.pokeChar = opts.pokeChar;
  this.pokeIndex = opts.pokeIndex;
  this.idChar = opts.idChar;
  this.valueChar = opts.valueChar;
};

module.exports = PokeCard;

PokeCard.prototype.toString = function() {
  return format("Pokecard[id: %s, pokeIndex: %d, idChar: %s, value: %d]",
    this.id,
    this.pokeIndex,
    this.idChar,
    this.value);
};

PokeCard.prototype.setBit = function(bits) {
  if (this.pokeIndex <= 28) {
    bits[0] |= 1 << (this.pokeIndex - 1);
  } else {
    bits[1] |= 1 << (this.pokeIndex - 28 - 1);
  }
};

PokeCard.init = function() {
  if (allPokeCards.length > 0)
    return;

  var idChars = ['3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K', 'A', '2', 'w', 'W'];
  var indexes = [3,4,5,6,7,8,9,10,11,12,13,1,2];
  var types = ["d", "c", "b", "a"];
  var ci = 1;
  for (var i=0; i<indexes.length; i++) {
    for (var typeIndex=0; typeIndex<types.length; typeIndex++) {
      var pokeIndex = ci++;
      var pokeValue = i + 3;
      var pi = ((indexes[i]<10) ? '0' : '') + indexes[i];
      var pokeId = types[typeIndex] + pi;
      var pokeChar = String.fromCharCode(pokeIndex + 64);
      var pokeCard = new PokeCard({
        id:pokeId,
        value: pokeValue,
        pokeChar: pokeChar,
        pokeIndex: pokeIndex,
        valueChar: PokeCardString[pokeValue],
        idChar: idChars[i]});

      allPokeCards.push(pokeCard);
//      allPokeCardsMap[pokeCard.id] = pokeCard;
//      allPokeCardsCharMap[pokeChar] = pokeCard;
//      allPokeCardsIdCharMap[idChars[i]] = pokeCard;
    }
  }

  var pokeCard = new PokeCard({
    id:'w01',
    value: PokeCardValue.SMALL_JOKER,
    pokeChar: String.fromCharCode(ci + 64),
    pokeIndex: ci,
    valueChar: PokeCardString[PokeCardValue.SMALL_JOKER],
    idChar: idChars[13]
  });
  allPokeCards.push(pokeCard);
//  allPokeCardsMap[pokeCard.id] = pokeCard;
//  allPokeCardsCharMap[poke] = pokeCard;
//  allPokeCardsIdCharMap[idChars[i]] = pokeCard;

  ci++;
  pokeCard = new PokeCard({
    id:'w02',
    value: PokeCardValue.BIG_JOKER,
    pokeChar: String.fromCharCode(ci + 64),
    pokeIndex: ci,
    valueChar: PokeCardString[PokeCardValue.BIG_JOKER],
    idChar: idChars[14]
  });
  allPokeCards.push(pokeCard);
//  allPokeCardsMap[pokeCard.id] = pokeCard;

  for(var index=0; index<allPokeCards.length; index++) {
    var pokeCard = allPokeCards[index];
    allPokeCardsMap[pokeCard.id] = pokeCard;
    allPokeCardsCharMap[pokeCard.pokeChar] = pokeCard;
  }
};

PokeCard.getAllPokeCards = function() {
  if (allPokeCards.length == 0)
    PokeCard.init();

  return allPokeCards;
};

PokeCard.shuffle = function() {
  if (allPokeCards.length == 0)
    PokeCard.init();

  var tmpPokeCards = allPokeCards.slice(0, allPokeCards.length);
  return mess( mess(tmpPokeCards) );
};

PokeCard.getByIds = function(ids) {
  if (typeof ids == 'string') {
    ids = ids.split(',');
  }

  var pokes = [];
  for (var index=0; index<ids.length; index++) {
    pokes.push(allPokeCardsMap[ids[index].trim()]);
  }

  return pokes;
};

PokeCard.getByChar = function(pokeChar) {
  return allPokeCardsCharMap[pokeChar];
};

PokeCard.pokeCardsFromChars = function(pokeChars) {
  if (!pokeChars)
    return null;

  var pokeCards = [];
  for(var index=0; index < pokeChars.length; index++) {
    var pokeCard = allPokeCardsCharMap[pokeChars[index]];
    if (pokeCard == null)
      return null;

    pokeCards.push( pokeCard );
  }

  return pokeCards;
};

PokeCard.getPokeValuesChars = function(pokeCards, sorted) {
  var tmpPokeCards = pokeCards;

  if (!sorted) {
    tmpPokeCards = pokeCards.slice(0).sort(utils.sortAscBy('index'));
  }

  var s = '';
  for (var index=0; index<tmpPokeCards.length; index++) {
    s = s + tmpPokeCards[index].valueChar;
  }

  return s;
};


PokeCard.allPokeCardsCharMap = allPokeCardsCharMap;