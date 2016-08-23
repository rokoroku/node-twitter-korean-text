/**
 * Created by rokoroku on 2016-08-23.
 */

const fs = require('fs');
const path = require('path');
const Java = require('java');

// Init java classes
const baseDir = path.join(__dirname, '../', 'jar');
const dependencies = fs.readdirSync(baseDir);
dependencies.forEach(function (dependency) {
    Java.classpath.push(baseDir + "/" + dependency);
});

export class JavaObject {
    constructor(className, value) {
        if (value) {
            this._instance = Java.newInstanceSync(className, value);
        } else {
            this._instance = Java.newInstanceSync(className);
        }
    }

    get instance() {
        return this._instance;
    }
}

export class JavaArrayList extends JavaObject {
    constructor(value) {
        super('java.util.ArrayList', value);
    }

    async add(...items) {
        await items.map((item) => this.instance.addSync(item));
    }
}

export default class TwitterKoreanProcessor {

    static get instance() {
        if (!this._instance) {
            this._instance = Java.import('com.twitter.penguin.korean.TwitterKoreanProcessorJava');
        }
        return this._instance;
    }

    /**
     * Normalize Korean text
     * 그랰ㅋㅋㅋㅋㅋㅋ -> 그래ㅋㅋ
     *
     * @param text Input text.
     * @return Normalized text.
     */
    static async normalize(text) {
        return this.instance.normalizeSync(text);
    }

    /**
     * Tokenize with the builder options.
     *
     * @param text Input text.
     * @return A list of Korean Tokens (run tokensToJsonArray to transform to Java List)
     */
    static async tokenize(text) {
        return this.instance.tokenizeSync(text);
    }


    /**
     * Add user-defined words to the noun dictionary. Spaced words are ignored.
     *
     * @param words List of user nouns.
     */
    static async addNounsToDictionary(...words) {
        if (Array.isArray(words[0])) words = words[0];

        let list = new JavaArrayList();
        await list.add(...words);
        return this.instance.addNounsToDictionarySync(list.instance);
    }

    /**
     * Tokenize with the builder options into a Javascript Object.
     *
     * @param tokens Korean tokens (output of tokenize(CharSequence text)).
     * @param keepSpace Keep spaces
     * @return Array of token objects.
     */
    static async tokensToJsonArray(tokens, keepSpace = false) {
        const it = tokens.iteratorSync();
        const res = [];
        while (it.hasNextSync()) {
            const token = it.nextSync();
            const text = token.textSync();
            const koreanPos = token.posSync().toString();
            const offset = token.offsetSync();
            const length = token.lengthSync();
            const isUnknown = token.unknownSync();
            if (keepSpace || koreanPos !== 'Space') {
                res.push({ text, koreanPos, offset, length, isUnknown });
            }
        }
        return res;
    }

    /**
     * Stem Korean Verbs and Adjectives
     *
     * @param tokens Korean tokens (output of tokenize(CharSequence text)).
     * @return StemmedTextWithTokens(text, tokens)
     */
    static async stem(tokens) {
        return this.instance.stemSync(tokens);
    }

    /**
     * Split input text into sentences.
     *
     * @param text Input text.
     * @return Array of Sentence objects.
     */
    static async splitSentences(text) {
        const sentences = this.instance.splitSentencesSync(text);
        const it = sentences.iteratorSync();
        const res = [];
        while (it.hasNextSync()) {
            const sentence = it.nextSync();
            const text = sentence.textSync();
            const start = sentence.startSync();
            const end = sentence.endSync();
            res.push({ text, start, end });
        }
        return res;
    }

    /**
     * Extract phrases from Korean input text
     *
     * @param tokens Korean tokens (output of tokenize(CharSequence text)).
     * @param filterSpam
     * @param includeHashtags
     * @return Array of phrase CharSequences.
     */
    static async extractPhrases(tokens, filterSpam = true, includeHashtags = false) {
        const phrases = this.instance.extractPhrasesSync(tokens, filterSpam, includeHashtags);
        const it = phrases.iteratorSync();
        const res = [];
        while (it.hasNextSync()) {
            const phrase = it.nextSync();
            const text = phrase.textSync();
            const koreanPos = phrase.posSync().toString();
            const offset = phrase.offsetSync();
            const length = phrase.lengthSync();
            res.push({ text, koreanPos, offset, length });
        }
        return res;
    }

    /**
     * Detokenize the input list of words.
     *
     * @param words List of words.
     * @return String Detokenized string.
     */
    static async detokenize(...words) {
        if (Array.isArray(words[0])) words = words[0];

        const list = new JavaArrayList();
        await list.add(...words);
        const detokenized = await this.instance.detokenizeSync(list.instance);
        return detokenized.toString();
    }
}
