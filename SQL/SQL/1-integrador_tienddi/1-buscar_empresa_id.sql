SELECT id_empresa, nit_empresa, nombre_empresa, telefono, email_documentos
FROM empresas
WHERE es_activo = 1
  AND id_empresa = :id_empresa
LIMIT 20;
