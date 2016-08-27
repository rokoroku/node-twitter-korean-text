/**
 * Created by rokoroku on 2016-08-23.
 */

'use strict';

const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const TwitterKoreanProcessor = require('../');

lab.test('test normalize', (done) => {
    const text = '힘들겟씀다 그래욬ㅋㅋㅋ';
    const result = TwitterKoreanProcessor.normalizeSync(text);
    Code.expect(result).to.equal('힘들겠습니다 그래요ㅋㅋ');
    done();
});

lab.test('test tokenize', (done) => {
    const text = '착한강아지상을 받은 루루';
    const result = TwitterKoreanProcessor.tokenizeSync(text);
    Code.expect(result.toString()).to.equal(
        'List(착한(Adjective: 0, 2), 강아지(Noun: 2, 3), 상(Suffix: 5, 1), 을(Josa: 6, 1), ' +
        ' (Space: 7, 1), 받은(Verb: 8, 2),  (Space: 10, 1), 루루(Noun: 11, 2))');
    done();
});

lab.test('test tokens to json array', (done) => {
    const text = '착한강아지상을 받은 루루';
    const tokens = TwitterKoreanProcessor.tokenizeSync(text);
    Code.expect(TwitterKoreanProcessor.tokensToJsonArraySync(tokens, true)).to.equal([
        { 'text': '착한', 'koreanPos': 'Adjective', 'offset': 0, 'length': 2, 'isUnknown': false },
        { 'text': '강아지', 'koreanPos': 'Noun', 'offset': 2, 'length': 3, 'isUnknown': false },
        { 'text': '상', 'koreanPos': 'Suffix', 'offset': 5, 'length': 1, 'isUnknown': false },
        { 'text': '을', 'koreanPos': 'Josa', 'offset': 6, 'length': 1, 'isUnknown': false },
        { 'text': ' ', 'koreanPos': 'Space', 'offset': 7, 'length': 1, 'isUnknown': false },
        { 'text': '받은', 'koreanPos': 'Verb', 'offset': 8, 'length': 2, 'isUnknown': false },
        { 'text': ' ', 'koreanPos': 'Space', 'offset': 10, 'length': 1, 'isUnknown': false },
        { 'text': '루루', 'koreanPos': 'Noun', 'offset': 11, 'length': 2, 'isUnknown': false }
    ]);
    Code.expect(TwitterKoreanProcessor.tokensToJsonArraySync(tokens, false)).to.equal([
        { 'text': '착한', 'koreanPos': 'Adjective', 'offset': 0, 'length': 2, 'isUnknown': false },
        { 'text': '강아지', 'koreanPos': 'Noun', 'offset': 2, 'length': 3, 'isUnknown': false },
        { 'text': '상', 'koreanPos': 'Suffix', 'offset': 5, 'length': 1, 'isUnknown': false },
        { 'text': '을', 'koreanPos': 'Josa', 'offset': 6, 'length': 1, 'isUnknown': false },
        { 'text': '받은', 'koreanPos': 'Verb', 'offset': 8, 'length': 2, 'isUnknown': false },
        { 'text': '루루', 'koreanPos': 'Noun', 'offset': 11, 'length': 2, 'isUnknown': false }
    ]);
    done();
});

lab.test('test stemming', (done) => {
    const text = '게으른 아침이 밝았구나';
    const tokens = TwitterKoreanProcessor.tokenizeSync(text);
    const stemmed = TwitterKoreanProcessor.stemSync(tokens);
    const jsonTokens = TwitterKoreanProcessor.tokensToJsonArraySync(stemmed);
    Code.expect(jsonTokens).to.equal([
        { 'text': '게으르다', 'koreanPos': 'Adjective', 'offset': 0, 'length': 3, 'isUnknown': false },
        { 'text': '아침', 'koreanPos': 'Noun', 'offset': 4, 'length': 2, 'isUnknown': false },
        { 'text': '이', 'koreanPos': 'Josa', 'offset': 6, 'length': 1, 'isUnknown': false },
        { 'text': '밝다', 'koreanPos': 'Verb', 'offset': 8, 'length': 4, 'isUnknown': false }
    ]);
    done();
});


lab.test('test add to dictionary', (done) => {
    const text = '압뱌뱌어버벼부뷰';
    const tokens = TwitterKoreanProcessor.tokenizeSync(text);
    Code.expect(TwitterKoreanProcessor.tokensToJsonArraySync(tokens, false)).to.equal([
        { 'text': '압뱌뱌어버벼부뷰', 'koreanPos': 'ProperNoun', 'offset': 0, 'length': 8, 'isUnknown': true }
    ]);

    TwitterKoreanProcessor.addNounsToDictionarySync('압뱌뱌', '어버벼', '부뷰');
    const tokensAfter = TwitterKoreanProcessor.tokenizeSync(text);
    Code.expect(TwitterKoreanProcessor.tokensToJsonArraySync(tokensAfter, false)).to.equal([
        { 'text': '압뱌뱌', 'koreanPos': 'Noun', 'offset': 0, 'length': 3, 'isUnknown': false },
        { 'text': '어버벼', 'koreanPos': 'Noun', 'offset': 3, 'length': 3, 'isUnknown': false },
        { 'text': '부뷰', 'koreanPos': 'Noun', 'offset': 6, 'length': 2, 'isUnknown': false }
    ]);
    done();
});

lab.test('test phrase extractor', (done) => {
    const text = '아름다운 트위터를 만들어 보자. 시발 #욕하지_말자';
    const tokens = TwitterKoreanProcessor.tokenizeSync(text);
    Code.expect(TwitterKoreanProcessor.extractPhrasesSync(tokens, true, true)).to.equal([
        { 'text': '아름다운 트위터', 'koreanPos': 'Noun', 'offset': 0, 'length': 8 },
        { 'text': '트위터', 'koreanPos': 'Noun', 'offset': 5, 'length': 3 },
        { 'text': '#욕하지_말자', 'koreanPos': 'Hashtag', 'offset': 21, 'length': 7 }
    ]);
    Code.expect(TwitterKoreanProcessor.extractPhrasesSync(tokens, true, false)).to.equal([
        { 'text': '아름다운 트위터', 'koreanPos': 'Noun', 'offset': 0, 'length': 8 },
        { 'text': '트위터', 'koreanPos': 'Noun', 'offset': 5, 'length': 3 },
    ]);
    Code.expect(TwitterKoreanProcessor.extractPhrasesSync(tokens, false, true)).to.equal([
        { 'text': '아름다운 트위터', 'koreanPos': 'Noun', 'offset': 0, 'length': 8 },
        { 'text': '시발', 'koreanPos': 'Noun', 'offset': 18, 'length': 2 },
        { 'text': '트위터', 'koreanPos': 'Noun', 'offset': 5, 'length': 3 },
        { 'text': '#욕하지_말자', 'koreanPos': 'Hashtag', 'offset': 21, 'length': 7 }
    ]);
    Code.expect(TwitterKoreanProcessor.extractPhrasesSync(tokens, false, false)).to.equal([
        { 'text': '아름다운 트위터', 'koreanPos': 'Noun', 'offset': 0, 'length': 8 },
        { 'text': '시발', 'koreanPos': 'Noun', 'offset': 18, 'length': 2 },
        { 'text': '트위터', 'koreanPos': 'Noun', 'offset': 5, 'length': 3 }
    ]);
    done();
});


lab.test('test phrase extractor 2', (done) => {
    const text = '시발 토토가의 인기폭발을 보니 미국에서 뉴키즈온더블럭 백스트릿보이스 조인트 컨서트';
    const tokens = TwitterKoreanProcessor.tokenizeSync(text);
    const phrases = TwitterKoreanProcessor.extractPhrasesSync(tokens);
    Code.expect(phrases).to.equal([
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
    ]);
    done();
});


lab.test('test sentence splitter', (done) => {
    const text = '가을이다! 남자는 가을을 탄다...... 그렇지? 루루야! 버버리코트 사러 가자!!!!';
    const sentences = TwitterKoreanProcessor.splitSentencesSync(text);
    Code.expect(sentences).to.equal([
        { 'text': '가을이다!', 'start': 0, 'end': 5 },
        { 'text': '남자는 가을을 탄다......', 'start': 6, 'end': 22 },
        { 'text': '그렇지?', 'start': 23, 'end': 27 },
        { 'text': '루루야!', 'start': 28, 'end': 32 },
        { 'text': '버버리코트 사러 가자!!!!', 'start': 33, 'end': 48 }
    ]);
    done();
});

lab.test('test detokenizer', (done) => {
    const words = ['늘', '평온', '하게', '누워', '있', '는', '루루'];
    const detokenized = TwitterKoreanProcessor.detokenizeSync(words);
    Code.expect(detokenized).to.equal('늘 평온하게 누워있는 루루');
    done();
});
