SELECT id_empresa, nit_empresa, nombre_empresa, telefono, email_documentos
FROM empresas
WHERE es_activo = 1
  AND telefono = :telefono
LIMIT 20;
