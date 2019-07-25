# gitChurn

compute churn for last 1000 commits per file/author

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install the following librarys

```bash
npm install chalk
npm install clear
npm install figlet
npm install commander
npm install simple-git
npm install fs
npm install clui
npm install recursive-readdir
npm install cli-color
```

## examples
per file mode
```
 ts-node #path_to_index.ts -f #git_repo_path
```
per Autor mode
```
 ts-node #path_to_index.ts -u #git_repo_path
```
