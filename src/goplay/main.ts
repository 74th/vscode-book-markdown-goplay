import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

class NotFoundCodeSectonError extends Error {
}

/**
 * メイン
 */
export default function main() {

    if (!vscode.window.activeTextEditor) {
        return;
    }

    try {
        const editor = vscode.window.activeTextEditor;
        const [code, endLine] = detectSource(editor);
        const output = runGoCode(code);
        appendMDText(editor, endLine, output);

    }catch (e) {
        if (e instanceof NotFoundCodeSectonError) {
            vscode.window.showErrorMessage("Not found go code section.");
        }
    }
}

/**
 * マークダウンの中のソースコード抽出
 * @param editor テキストエディタ
 * @returns コード, 末尾の行数
 */
const detectSource = (editor: vscode.TextEditor): [string, number] => {

    const cursorLine = editor.selection.active.line;
    let start: vscode.Position | null = null;
    let end: vscode.Position | null = null;
    for (let i = cursorLine; i >= 0; i--) {
        const line = editor.document.lineAt(i);
        if (line.text.startsWith("```go")) {
            start = editor.document.lineAt(i + 1).range.start;
            break;
        }
    }

    if (!start) {
        throw new NotFoundCodeSectonError();
    }

    for (let i = cursorLine; i < editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i);
        if (line.text.startsWith("```")) {
            end = line.range.start;
            break;
        }
    }

    if (!end) {
        throw new NotFoundCodeSectonError();
    }

    const code = editor.document.getText(new vscode.Range(start, end));
    return [code, end.line + 1];
};

/**
 * goのコマンドの実行
 * @param code ソースコードのテキスト
 * @returns 出力
 */
const runGoCode = (code: string): string => {
    const codePath = path.join(os.tmpdir(), "main.go");
    fs.writeFileSync(codePath, code);
    const cmd = "go run " + codePath;
    try {
        const buf = child_process.execSync(cmd);
        // 正常終了
        const output = buf.toString();
        return output;
    } catch (e) {
        // 異常終了
        return e.stderr.toString();
    }
};

/**
 * マークダウンテキストの追記
 * @param editor テキストエディタ
 * @param targetLine 挿入先の行数
 * @param text 挿入する
 */
const appendMDText = (editor: vscode.   TextEditor, targetLine: number, text: string) => {
    let eol: string;
    switch(editor.document.eol){
        case vscode.EndOfLine.CRLF:
            eol = "\r\n";
        default:
            eol = "\n";
    }
    const outputText = "```" + eol + text + eol + "```" + eol;
    editor.edit((edit) => {
        edit.insert(new vscode.Position(targetLine, 0), outputText);
    });
}
