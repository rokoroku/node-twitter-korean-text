/**
 * Created by rokoroku on 2016-08-23.
 */

'use strict';

const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const TwitterKoreanProcessor = require('../');

lab.test('test normalize', () => {
    const text = '힘들겟씀다 그래욬ㅋㅋㅋ';
    return TwitterKoreanProcessor.normalize(text)
        .then((result) => Code.expect(result).to.equal('힘들겠습니다 그래요ㅋㅋ'));
});

lab.test('test tokenize', () => {
    const text = '착한강아지상을 받은 루루';
    return TwitterKoreanProcessor.tokenize(text)
        .then((result) => Code.expect(result.toString()).to.equal(
            'List(착한(Adjective: 0, 2), 강아지(Noun: 2, 3), 상(Suffix: 5, 1), 을(Josa: 6, 1), ' +
            ' (Space: 7, 1), 받은(Verb: 8, 2),  (Space: 10, 1), 루루(Noun: 11, 2))'));
});

lab.test('test tokens to json array', () => {
    const text = '착한강아지상을 받은 루루';
    return TwitterKoreanProcessor.tokenize(text).then((tokens) => Promise.all([
        TwitterKoreanProcessor.tokensToJsonArray(tokens, true)   // keeping space
            .then((result) => Code.expect(result).to.equal([
                { 'text': '착한', 'koreanPos': 'Adjective', 'offset': 0, 'length': 2, 'isUnknown': false },
                { 'text': '강아지', 'koreanPos': 'Noun', 'offset': 2, 'length': 3, 'isUnknown': false },
                { 'text': '상', 'koreanPos': 'Suffix', 'offset': 5, 'length': 1, 'isUnknown': false },
                { 'text': '을', 'koreanPos': 'Josa', 'offset': 6, 'length': 1, 'isUnknown': false },
                { 'text': ' ', 'koreanPos': 'Space', 'offset': 7, 'length': 1, 'isUnknown': false },
                { 'text': '받은', 'koreanPos': 'Verb', 'offset': 8, 'length': 2, 'isUnknown': false },
                { 'text': ' ', 'koreanPos': 'Space', 'offset': 10, 'length': 1, 'isUnknown': false },
                { 'text': '루루', 'koreanPos': 'Noun', 'offset': 11, 'length': 2, 'isUnknown': false }
            ])),
        TwitterKoreanProcessor.tokensToJsonArray(tokens, false)  // not keeping space
            .then((result) => Code.expect(result).to.equal([
                { 'text': '착한', 'koreanPos': 'Adjective', 'offset': 0, 'length': 2, 'isUnknown': false },
                { 'text': '강아지', 'koreanPos': 'Noun', 'offset': 2, 'length': 3, 'isUnknown': false },
                { 'text': '상', 'koreanPos': 'Suffix', 'offset': 5, 'length': 1, 'isUnknown': false },
                { 'text': '을', 'koreanPos': 'Josa', 'offset': 6, 'length': 1, 'isUnknown': false },
                { 'text': '받은', 'koreanPos': 'Verb', 'offset': 8, 'length': 2, 'isUnknown': false },
                { 'text': '루루', 'koreanPos': 'Noun', 'offset': 11, 'length': 2, 'isUnknown': false }
            ]))
    ]));
});

lab.test('test stemming', () => {
    const text = '게으른 아침이 밝았구나';
    return TwitterKoreanProcessor.tokenize(text)
        .then((tokens) => TwitterKoreanProcessor.stem(tokens))
        .then((stemmed) => TwitterKoreanProcessor.tokensToJsonArray(stemmed))
        .then((tokens) => Code.expect(tokens).to.equal([
            { 'text': '게으르다', 'koreanPos': 'Adjective', 'offset': 0, 'length': 3, 'isUnknown': false },
            { 'text': '아침', 'koreanPos': 'Noun', 'offset': 4, 'length': 2, 'isUnknown': false },
            { 'text': '이', 'koreanPos': 'Josa', 'offset': 6, 'length': 1, 'isUnknown': false },
            { 'text': '밝다', 'koreanPos': 'Verb', 'offset': 8, 'length': 4, 'isUnknown': false }
        ]));
});


lab.test('test add to dictionary', () => {
    const text = '우햐나어가녀아뎌';
    return TwitterKoreanProcessor.tokenize(text)
        .then((tokens) => TwitterKoreanProcessor.tokensToJsonArray(tokens, false))
        .then((result) => Code.expect(result).to.equal([
            { 'text': '우햐나어가녀아뎌', 'koreanPos': 'ProperNoun', 'offset': 0, 'length': 8, 'isUnknown': true }
        ]))
        .then((result) => TwitterKoreanProcessor.addNounsToDictionary('우햐나', '어가녀', '아뎌'))
        .then((result) => TwitterKoreanProcessor.tokenize(text))
        .then((tokens) => TwitterKoreanProcessor.tokensToJsonArray(tokens, false))
        .then((result) => Code.expect(result).to.equal([
            { 'text': '우햐나', 'koreanPos': 'Noun', 'offset': 0, 'length': 3, 'isUnknown': false },
            { 'text': '어가녀', 'koreanPos': 'Noun', 'offset': 3, 'length': 3, 'isUnknown': false },
            { 'text': '아뎌', 'koreanPos': 'Noun', 'offset': 6, 'length': 2, 'isUnknown': false }
        ]));
});

lab.test('test phrase extractor', () => {
    const text = '아름다운 트위터를 만들어 보자. 시발 #욕하지_말자';
    return TwitterKoreanProcessor.tokenize(text).then((tokens) => Promise.all([
        TwitterKoreanProcessor.extractPhrases(tokens, true, true).then((phrases) =>
            Code.expect(phrases).to.equal([
                { 'text': '아름다운 트위터', 'koreanPos': 'Noun', 'offset': 0, 'length': 8 },
                { 'text': '트위터', 'koreanPos': 'Noun', 'offset': 5, 'length': 3 },
                { 'text': '#욕하지_말자', 'koreanPos': 'Hashtag', 'offset': 21, 'length': 7 }
            ])),
        TwitterKoreanProcessor.extractPhrases(tokens, true, false).then((phrases) =>
            Code.expect(phrases).to.equal([
                { 'text': '아름다운 트위터', 'koreanPos': 'Noun', 'offset': 0, 'length': 8 },
                { 'text': '트위터', 'koreanPos': 'Noun', 'offset': 5, 'length': 3 },
            ])),
        TwitterKoreanProcessor.extractPhrases(tokens, false, true).then((phrases) =>
            Code.expect(phrases).to.equal([
                { 'text': '아름다운 트위터', 'koreanPos': 'Noun', 'offset': 0, 'length': 8 },
                { 'text': '시발', 'koreanPos': 'Noun', 'offset': 18, 'length': 2 },
                { 'text': '트위터', 'koreanPos': 'Noun', 'offset': 5, 'length': 3 },
                { 'text': '#욕하지_말자', 'koreanPos': 'Hashtag', 'offset': 21, 'length': 7 }
            ])),
        TwitterKoreanProcessor.extractPhrases(tokens, false, false).then((phrases) =>
            Code.expect(phrases).to.equal([
                { 'text': '아름다운 트위터', 'koreanPos': 'Noun', 'offset': 0, 'length': 8 },
                { 'text': '시발', 'koreanPos': 'Noun', 'offset': 18, 'length': 2 },
                { 'text': '트위터', 'koreanPos': 'Noun', 'offset': 5, 'length': 3 }
            ]))
    ]));
});


lab.test('test phrase extractor 2', () => {
    const text = '시발 토토가의 인기폭발을 보니 미국에서 뉴키즈온더블럭 백스트릿보이스 조인트 컨서트';
    return TwitterKoreanProcessor.tokenize(text)
        .then((tokens) => TwitterKoreanProcessor.extractPhrases(tokens))
        .then((phrases) => Code.expect(phrases).to.equal([
            { 'text': '토토가', 'koreanPos': 'Noun', 'offset': 3, 'length': 3 },
            { 'text': '토토가의 인기폭발', 'koreanPos': 'Noun', 'offset': 3, 'length': 9 },
            { 'text': '인기폭발', 'koreanPos': 'Noun', 'offset': 8, 'length': 4 },
            { 'text': '미국', 'koreanPos': 'Noun', 'offset': 17, 'length': 2 },
            { 'text': '뉴키즈온더블럭', 'koreanPos': 'Noun', 'offset': 22, 'length': 7 },
            { 'text': '뉴키즈온더블럭 백스트릿보이스', 'koreanPos': 'Noun', 'offset': 22, 'length': 15 },
            { 'text': '뉴키즈온더블럭 백스트릿보이스 조인트', 'koreanPos': 'Noun', 'offset': 22, 'length': 19 },
            { 'text': '백스트릿보이스 조인트', 'koreanPos': 'Noun', 'offset': 30, 'length': 11 },
            { 'text': '뉴키즈온더블럭 백스트릿보이스 조인트 컨서트', 'koreanPos': 'Noun', 'offset': 22, 'length': 23 },
            { 'text': '백스트릿보이스 조인트 컨서트', 'koreanPos': 'Noun', 'offset': 30, 'length': 15 },
            { 'text': '조인트 컨서트', 'koreanPos': 'Noun', 'offset': 38, 'length': 7 },
            { 'text': '인기', 'koreanPos': 'Noun', 'offset': 8, 'length': 2 },
            { 'text': '폭발', 'koreanPos': 'Noun', 'offset': 10, 'length': 2 },
            { 'text': '스트릿', 'koreanPos': 'Noun', 'offset': 31, 'length': 3 },
            { 'text': '보이스', 'koreanPos': 'Noun', 'offset': 34, 'length': 3 },
            { 'text': '조인트', 'koreanPos': 'Noun', 'offset': 38, 'length': 3 },
            { 'text': '컨서트', 'koreanPos': 'Noun', 'offset': 42, 'length': 3 }
        ]));
});


lab.test('test sentence splitter', () => {
    const text = '가을이다! 남자는 가을을 탄다...... 그렇지? 루루야! 버버리코트 사러 가자!!!!';
    return TwitterKoreanProcessor.splitSentences(text).then((result) =>
        Code.expect(result).to.equal([
            { 'text': '가을이다!', 'start': 0, 'end': 5 },
            { 'text': '남자는 가을을 탄다......', 'start': 6, 'end': 22 },
            { 'text': '그렇지?', 'start': 23, 'end': 27 },
            { 'text': '루루야!', 'start': 28, 'end': 32 },
            { 'text': '버버리코트 사러 가자!!!!', 'start': 33, 'end': 48 }
        ]));
});

lab.test('test detokenizer', () => {
    const words = ['늘', '평온', '하게', '누워', '있', '는', '루루'];
    return TwitterKoreanProcessor.detokenize(words).then((result) =>
        Code.expect(result).to.equal('늘 평온하게 누워있는 루루'));
});
