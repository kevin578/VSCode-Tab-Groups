
'use strict';
import { commands, Disposable, TextEditor, window } from 'vscode';
import { BuiltInCommands } from './constants';

export class ActiveEditorTracker extends Disposable {

    private _disposable: Disposable;
    private _resolver: any;

    constructor() {
        super(() => this.dispose());

        this._disposable = window.onDidChangeActiveTextEditor(e => this._resolver && this._resolver(e));
    }

    dispose() {
        // tslint:disable-next-line: no-unused-expression
        this._disposable && this._disposable.dispose();
    }

    async awaitCloseAll(): Promise<void> {
        await this.closeAll();
        return await new Promise(resolve => setTimeout(() => {
            resolve();
        }, 100));
    }

    async awaitClose(): Promise<void> {
        await this.close();
        return await new Promise(resolve => setTimeout(() => {
            resolve();
        }, 100));
    }

    async awaitNext(timeout: number = 300): Promise<TextEditor> {
        this.next();
        return this.wait(timeout);
    }

    async close(): Promise<{} | undefined> {
        return commands.executeCommand(BuiltInCommands.CloseActiveEditor);
    }

    async closeAll(): Promise<{} | undefined> {
        return commands.executeCommand(BuiltInCommands.CloseAllEditorGroups);
    }

    async next(): Promise<{} | undefined> {
        return commands.executeCommand(BuiltInCommands.NextEditor);
    }

    async wait(timeout: number = 300): Promise<TextEditor> {
        const editor = await new Promise<TextEditor>((resolve, reject) => {
            let timer: any;

            this._resolver = (editor: TextEditor) => {
                if (timer) {
                    clearTimeout(timer as any);
                    timer = 0;
                    resolve(editor);
                }
            };

            timer = setTimeout(() => {
                resolve(window.activeTextEditor);
                timer = 0;
            }, timeout) as any;
        });
        this._resolver = undefined;
        return editor;
    }
}
