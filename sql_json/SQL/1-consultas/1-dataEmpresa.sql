SELECT e.id_empresa,e.nit_empresa,e.nombre_empresa,e.fecha_creacion,e.telefono,e.pais,e.direccion,e.departamento,e.ciudad,e.email_documentos,e.contacto,se.nombre_sector_empresa FROM empresas e 
LEFT JOIN sector_empresa se ON(e.id_sector_empresa=se.id_sector_empresa) WHERE e.id_empresa=:id_empresa;