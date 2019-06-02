import * as vscode from 'vscode';
import { MarkdownGoplay } from './goplay/main';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "markdown-goplay" is now active!');

    const main = new MarkdownGoplay()

	let disposable = vscode.commands.registerCommand(
    "markdown-goplay.execute-cursor",
    () => {
        main.run();
    }
  );

	context.subscriptions.push(disposable);
}

export function deactivate() {}
