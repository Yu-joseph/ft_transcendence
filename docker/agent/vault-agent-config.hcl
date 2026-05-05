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
  command     = "sh reload.sh"
}

template {
  source      = "/vault/templates/br_db.tpl"
  destination = "/vault/aii/file.env"
  perms       = 0644
  command     = "sh reload_br.sh"
}


template {
  source      = "/vault/templates/ai.tpl"
  destination = "/vault/aii/apiss.env"
  perms       = 0644
}

template {
  source      = "/vault/templates/auth.tpl"
  destination = "/vault/secrets/apiss.env"
  perms       = 0644
}

template {
  source      = "/vault/templates/game.tpl"
  destination = "/vault/game/apiss.env"
  perms       = 0644
}

template {
  source      = "/vault/templates/chat.tpl"
  destination = "/vault/chat/apiss.env"
  perms       = 0644
}