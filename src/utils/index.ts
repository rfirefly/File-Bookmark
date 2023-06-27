import * as vscode from 'vscode'

export interface UriWithType {
  path: string
  type: vscode.FileType
}

// 获取 file 的类型
export async function getUriType(file: vscode.Uri) {
  const type = (await vscode.workspace.fs.stat(file)).type
  return {
    path: file.path,
    type,
  }
}
