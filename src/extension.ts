// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

type Namespace = {
	path: string;
	namespace: string;
};
const defaultNamespace: Namespace = {
	path: "force-app/main/default/lwc",
	namespace: "c",
};
const VIEW_SOURCE =
	"/Users/michael/Code/lwc-recipes/force-app/main/default/lwc/viewSource/viewSource.html";

export function activate(context: vscode.ExtensionContext) {
	console.log("Navigation extension is active");

	const provider = vscode.languages.registerDefinitionProvider({
		scheme: "file",
		language: "html",
	}, {
		provideDefinition,
	});
	context.subscriptions.push(provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function provideDefinition(
	document: vscode.TextDocument,
	position: vscode.Position,
	token: vscode.CancellationToken,
) {
	// Match if cursor is currently on an element name
	const wordRange = document.getWordRangeAtPosition(position, /<\/?[\w-_]+/);
	if (!wordRange) {return;}
	const fullyQualifiedName = document.getText(wordRange).replace(
		/[<>\/]/g,
		"",
	);

	const componentPath = getComponentPath(fullyQualifiedName);
	if (!componentPath) {
		return;
	}

	console.log("Going to definition");
	return new vscode.Location(
		vscode.Uri.file(componentPath),
		new vscode.Position(0, 0),
	);
}

function getComponentPath(fullyQualifiedName: string): string | undefined {
	const splitName = fullyQualifiedName.split("-");
	// If it's a built-in or lightning component, don't try to look up an implementation
	if (splitName.length < 2 || splitName[0] === "lightning") {
		return undefined;
	}

	const componentNamespace = splitName[0];

	const namespaceDir = getNamespaceDir(componentNamespace);
	if (!namespaceDir) {
		return undefined;
	}
	const componentName = toCamelCase(splitName.slice(1));
	return path.join(namespaceDir, componentName, `${componentName}.html`);
}

function toCamelCase(nameComponents: Array<string>) {
	if (nameComponents.length === 1) {
		return nameComponents[0];
	}
	const firstWord = nameComponents[0];
	const subsequentWords = nameComponents.slice(1).map((component) =>
		component.slice(0, 1).toUpperCase() + component.slice(1)
	);
	return firstWord + subsequentWords;
}

function getNamespaceDir(elementNamespace: string) {
	const namespaceDirRelative = retrieveNamespacesFromConfig().find((
		namespace,
	) => namespace.namespace === elementNamespace)?.path;
	if (!namespaceDirRelative) {
		console.warn(
			"Could not find a component directory for the namespace: ",
			elementNamespace,
		);
		return undefined;
	}

	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return undefined;
	}
	const workspaceRoot = workspaceFolders[0].uri.fsPath;

	const namespaceDir = path.join(workspaceRoot, namespaceDirRelative);
	console.log("Component dir resolve to", namespaceDir);
	return namespaceDir;
}

function retrieveNamespacesFromConfig() {
	const config = vscode.workspace.getConfiguration("lwcHtmlNavigation");
	if (!config.get<Array<Namespace>>("namespaces")) {
		console.log(
			"No namespaces specified in workspace config. Using default namespace",
		);
	}
	return config.get<Array<Namespace>>("namespaces") ?? [defaultNamespace];
}
