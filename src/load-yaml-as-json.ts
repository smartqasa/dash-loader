import yaml from 'js-yaml';

export const loadYamlAsJson = async <T>(yamlFilePath: string): Promise<T> => {
  const response = await fetch(yamlFilePath);

  if (!response.ok) {
    throw new Error(
      `[loadYamlAsJson] Failed to fetch YAML file. HTTP Status: ${response.status} - ${response.statusText}`
    );
  }

  const yamlContent = await response.text();
  return yaml.load(yamlContent) as T;
};
