export type BackupDataInputDTO = {
  database: string;
  collectionsName: string;
  data: any;
};

export type RecoverDataDTO = {
  database: string;
  collectionName: string;
};

export type GetLogsDTO = {
  database: string;
};
