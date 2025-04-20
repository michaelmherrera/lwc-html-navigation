// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";

type Namespace = {
	path: string;
	namespace: string;
};
const DEFAULT_NAMESPACE: Namespace = {
	path: "force-app/main/default/lwc",
	namespace: "c",
};

export function deactivate() {}

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


/**
 * 
 * @param document 
 * @param position 
 * @param token 
 * @returns 
 */
function provideDefinition(
	document: vscode.TextDocument,
	position: vscode.Position,
	token: vscode.CancellationToken,
) {
	// Match if cursor is currently on an element name
	const wordRange = document.getWordRangeAtPosition(position, /<\/?[\w-_]+/);
	if (!wordRange) {return;}

	// Name of the component, including the namespace. In the format
	// `<namespace>-<component-name>`
	// Example: `c-contact-tile`
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

/**
 * Given a fully-qualified component name, determine the file path of the component.
 * 
 * The user may define custom namespaces, so we read the config value of 
 * `lwcHtmlNavigation.namespaces` to determine the directory for a given namespace.
 * 
 * @param fullyQualifiedName fully qualified component name (ex: c-contact-tile )
 * @returns the components file path
 */
function getComponentPath(fullyQualifiedName: string): string | undefined {

	const splitName = fullyQualifiedName.split("-");
	// If it's a standard web element or lightning component, 
	// don't try to look up an implementation
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



/**
 * Get the directory associated with a namespace.
 * 
 * Reads from the plugin config. If the namespace isn't 
 * declared in the config, return `undefined`.
 * 
 * @param elementNamespace 
 * @returns 
 */
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
	console.log("Component dir resolved to", namespaceDir);
	return namespaceDir;
}

/**
 * Retrieve the namespaces from the config `lwcHtmlNavigation.namespaces`. 
 * 
 * If it's not defined, return the default component directory (`force-app/main/default/lwc`)
 * @returns 
 */
function retrieveNamespacesFromConfig(): Namespace[] {
	const config = vscode.workspace.getConfiguration("lwcHtmlNavigation");
	const namespaceConfigs = config.get<Array<Namespace>>("namespaces");
	if (namespaceConfigs === undefined) {
		console.log(
			"No namespaces specified in workspace config. Using default namespace",
		);
		return [DEFAULT_NAMESPACE];
	}
	return namespaceConfigs;
}

/**
 * Convert an array of strings into a single camel-case string
 * 
 * Ex: [foo,bar,biz] -> fooBarBiz
 * @param nameComponents 
 * @returns 
 */
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
