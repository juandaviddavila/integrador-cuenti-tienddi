SELECT id_empresa, nit_empresa, nombre_empresa, telefono, email_documentos
FROM empresas
WHERE es_activo = 1
  AND email_documentos = :email
LIMIT 20;
