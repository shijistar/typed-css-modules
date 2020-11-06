import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import isThere from "is-there";
import * as mkdirp from 'mkdirp';
import * as util from "util";
import { string } from "yargs";

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

interface DtsContentOptions {
    dropExtension: boolean;
    rootDir: string;
    searchDir: string;
    outDir: string;
    indent: number;
    rInputPath: string;
    rawTokenList: string[];
    resultList: string[];
    EOL: string;
}

export class DtsContent {
    private dropExtension: boolean;
    private rootDir: string;
    private searchDir: string;
    private outDir: string;
    private indent: number;
    private rInputPath: string;
    private rawTokenList: string[];
    private resultList: string[];
    private EOL: string;

    constructor(options: DtsContentOptions) {
        this.dropExtension = options.dropExtension;
        this.rootDir = options.rootDir;
        this.searchDir = options.searchDir;
        this.outDir = options.outDir;
        this.indent = options.indent;
        this.rInputPath = options.rInputPath;
        this.rawTokenList = options.rawTokenList;
        this.resultList = options.resultList;
        this.EOL = options.EOL;
    }

    public get contents(): string[] {
        return this.resultList;
    }

    public get formatted(): string {
        if(!this.resultList || !this.resultList.length) return '';
        return [
            'declare const styles: {',
            ...this.resultList.map(line => ' '.repeat(this.indent || 2) + line),
            '};',
            'export = styles;',
            ''
        ].join(os.EOL) + this.EOL;
    }

    public get tokens(): string[] {
        return this.rawTokenList;
    }

    public get outputFilePath(): string {
        const outputFileName = this.dropExtension ? removeExtension(this.rInputPath) : this.rInputPath;
        return path.join(this.rootDir, this.outDir, outputFileName + '.d.ts');
    }

    public get inputFilePath(): string {
        return path.join(this.rootDir, this.searchDir, this.rInputPath);
    }

    public async writeFile(postprocessor = (formatted: string) => formatted): Promise<void> {
        const finalOutput = postprocessor(this.formatted);

        const outPathDir = path.dirname(this.outputFilePath);
        if(!isThere(outPathDir)) {
            mkdirp.sync(outPathDir);
        }

        let isDirty = false;

        if(!isThere(this.outputFilePath)) {
            isDirty = true;
        } else {
            const content = (await readFile(this.outputFilePath)).toString();

            if(content !== finalOutput) {
                isDirty = true;
            }
        }

        if(isDirty) {
            await writeFile(this.outputFilePath, finalOutput, 'utf8');
        }
    }
}

function removeExtension(filePath: string): string {
    const ext = path.extname(filePath);
    return filePath.replace(new RegExp(ext + '$'), '');
}
