import yaml from 'js-yaml';

export const loadYamlAsJson = async <T>(
  yamlFilePath: string,
  reportMissing: boolean = false
): Promise<T | undefined> => {
  try {
    const response = await fetch(yamlFilePath);

    if (!response.ok) {
      if (!reportMissing) return undefined;

      throw new Error(
        `[loadYamlAsJson] Failed to fetch YAML file. HTTP Status: ${response.status} - ${response.statusText}`
      );
    }

    const yamlContent = await response.text();
    return yaml.load(yamlContent) as T;
  } catch (err) {
    if (!reportMissing) return undefined;

    throw err;
  }
};
