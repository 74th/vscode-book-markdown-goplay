import * as vscode from 'vscode';
import main from './goplay/main';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "markdown-goplay" is now active!');

	let disposable = vscode.commands.registerCommand(
    "markdown-goplay.execute-cursor",
    () => {
      main();
    }
  );

	context.subscriptions.push(disposable);
}

export function deactivate() {}
