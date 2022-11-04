import path from 'path'
import fs from 'fs/promises'


const packagePath = path.resolve('package')
const distPath = path.resolve('dist')
const srcTypesPath = path.resolve('src', 'types')
const packageTypesPath = path.join(packagePath, 'types')

/**
 * @param {string} origin
 * @param {string} destination 
 */
const copyDir = async (origin, destination) => {
  await fs.mkdir(destination)
  const files = await fs.readdir(origin)
  await Promise.all(files.map(async file => {
    const filePath = path.join(origin, file)
    const stats = await fs.lstat(filePath)
    const destinationPath = path.join(destination, file)
    
    if (stats.isDirectory())
      return await copyDir(filePath, destinationPath)

    const fileContent = await fs.readFile(filePath)
    return await fs.writeFile(destinationPath, fileContent)
  }))
}

const copyFile = async (file, destination) => {
  const filePath = path.resolve(file)
  const destinationPath = path.resolve(destination)
  const fileContent = await fs.readFile(filePath)
  await fs.writeFile(destinationPath, fileContent)
}

const copyPackage = async () => {
  const filePath = path.resolve('package.json')
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const fileJson = JSON.parse(fileContent)
  fileJson.name = fileJson.name.replace('-temp', '')
  await fs.writeFile(path.resolve('package/package.json'), JSON.stringify(fileJson, null, 2), 'utf-8')
}


await copyDir(distPath, packagePath)
await copyDir(srcTypesPath, packageTypesPath)
await copyPackage()