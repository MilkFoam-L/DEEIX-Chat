export type PromptPresetScope = "builtin" | "user";

export type PromptPresetDTO = {
  id: number;
  scope: PromptPresetScope;
  title: string;
  trigger: string;
  description: string;
  content: string;
  enabled: boolean;
  sortOrder: number;
  createdByUserID: number;
  updatedByUserID: number;
  createdAt: string;
  updatedAt: string;
};

export type PromptPresetPage = {
  results: PromptPresetDTO[];
  total: number;
};

export type WritePromptPresetRequest = {
  title: string;
  trigger: string;
  description: string;
  content: string;
  enabled: boolean;
  sortOrder: number;
};

export type PatchPromptPresetRequest = Partial<WritePromptPresetRequest>;

export type PromptPresetData = {
  promptPreset: PromptPresetDTO;
};

export type PromptPresetDeleteData = {
  deleted: boolean;
};
