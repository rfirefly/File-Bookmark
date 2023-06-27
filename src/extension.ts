import * as vscode from 'vscode'
import { ExplorerBookmark } from './provider/ExplorerBookmark'

export function activate(context: vscode.ExtensionContext) {
  const explorerBookmark = new ExplorerBookmark(
    context,
    vscode.workspace.workspaceFolders,
  )

  vscode.window.registerTreeDataProvider('file-bookmark', explorerBookmark)

  context.subscriptions.push(
    ...[
      vscode.commands.registerCommand('file-bookmark.refreshEntry', () =>
        explorerBookmark.refresh(),
      ),
      vscode.commands.registerCommand('file-bookmark.openFile', (file) => {
        vscode.commands.executeCommand(
          'vscode.open',
          vscode.Uri.parse(file.resourceUri.path),
        )
      }),
      vscode.commands.registerCommand('file-bookmark.selectItem', args =>
        explorerBookmark.selectItem(vscode.Uri.parse(args.path)),
      ),
      vscode.commands.registerCommand(
        'file-bookmark.removeItem',
        (args) => {
          explorerBookmark.removeItem(args.resourceUri)
        },
      ),
      vscode.commands.registerCommand(
        'file-bookmark.cantRemoveItemMsg',
        () => {
          vscode.window.showInformationMessage(
            'You can only remove items that were directly added to the view',
          )
        },
      ),
      vscode.commands.registerCommand('file-bookmark.removeAllItems', () =>
        explorerBookmark.removeAllItems(),
      ),
    ],
  )
}

export function deactivate() {}
