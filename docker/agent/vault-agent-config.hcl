vault {
  address         = "https://vault:8200"
  tls_skip_verify = false
  ca_cert         = "/vault/certs/ca.crt"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path                   = "/vault/role-id"
      secret_id_file_path                 = "/vault/secret-id"
      remove_secret_id_file_after_reading = false
    }
  }

  sink "file" {
    config = {
      path = "/vault/token"
      mode = 0644
    }
  }
}

template {
  source      = "/vault/templates/database.tpl"
  destination = "/vault/secrets/database.env"
  perms       = 0644
}

template {
  source      = "/vault/templates/apis.tpl"
  destination = "/vault/secrets/apis.env"
  perms       = 0644
}

