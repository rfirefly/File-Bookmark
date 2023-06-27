import * as path from 'node:path'
import * as vscode from 'vscode'
import type { UriWithType } from '../utils'
import { getUriType } from '../utils'
import { FileSystemObject } from './FileSystemObject'

export class ExplorerBookmark implements vscode.TreeDataProvider<FileSystemObject> {
  private selectedFSObjects: UriWithType[] = []

  private saveWorkspaceSetting: boolean | undefined = false

  private _onDidChangeTreeData: vscode.EventEmitter<
    FileSystemObject | undefined | null | void
  > = new vscode.EventEmitter<FileSystemObject | undefined | null | void>()

  readonly onDidChangeTreeData: vscode.Event<
    FileSystemObject | undefined | null | void
  > = this._onDidChangeTreeData.event

  constructor(
    private extensionContext: vscode.ExtensionContext,
    private workspaceRoot: readonly vscode.WorkspaceFolder[] | undefined,
  ) {
    this.getSettings()
    if (this.saveWorkspaceSetting && this.selectedFSObjects.length > 0)
      this.refresh()
  }

  getTreeItem(element: FileSystemObject): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  async getChildren(element?: FileSystemObject): Promise<FileSystemObject[]> {
    if (element) {
      return this.directorySearch(element.resourceUri)
    }
    else {
      return this.selectedFSObjects.length > 0
        ? this.createEntries(this.selectedFSObjects)
        : Promise.resolve([])
    }
  }

  async selectItem(uri: vscode.Uri | undefined) {
    if (uri) {
      const pathWithType = await getUriType(uri)
      this.selectedFSObjects.push(pathWithType)
    }
    this.refresh()
    this.saveWorkspace()
  }

  async removeItem(uri: vscode.Uri | undefined) {
    if (uri) {
      const pathWithType = await getUriType(uri)

      const index = this.selectedFSObjects.indexOf(pathWithType)
      if (index > -1)
        this.selectedFSObjects.splice(index, 1)
    }
    this.refresh()
    this.saveWorkspace()
  }

  private async directorySearch(uri: vscode.Uri) {
    const folders = await vscode.workspace.fs.readDirectory(uri)
    return folders
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((item) => {
        const [name, type] = item
        const isDirectory
          = type === vscode.FileType.Directory
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None

        return new FileSystemObject(
          name,
          isDirectory,
          vscode.Uri.file(`${uri.path}/${name}`),
        )
      })
  }

  private async createEntries(selectedFSObjects: UriWithType[]) {
    const folderSystem: FileSystemObject[] = []

    for (const fsItem of selectedFSObjects) {
      const { path: filePath, type } = fsItem
      const file = vscode.Uri.file(filePath)

      folderSystem.push(
        new FileSystemObject(
          `${path.basename(filePath)}`,
          type === vscode.FileType.File
            ? vscode.TreeItemCollapsibleState.None
            : vscode.TreeItemCollapsibleState.Collapsed,
          file,
        ).setContextValue('directlySavedItem'),
      )
    }

    return folderSystem
  }

  private getSettings() {
    this.saveWorkspaceSetting = vscode.workspace
      .getConfiguration('file-bookmark')
      .get('saveWorkspace')
    this.selectedFSObjects
      = (this.workspaceRoot
        ? this.extensionContext.workspaceState.get('savedWorkspaceItems')
        : this.extensionContext.globalState.get('savedWorkspaceItems')) || []
  }

  removeAllItems() {
    this.selectedFSObjects = []
    this.refresh()
    this.saveWorkspace()
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  saveWorkspace() {
    this.workspaceRoot
      ? this.extensionContext.workspaceState.update(
        'savedWorkspaceItems',
        this.selectedFSObjects,
      )
      : this.extensionContext.globalState.update(
        'savedWorkspaceItems',
        this.selectedFSObjects,
      )
  }
}
