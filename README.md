# 🧾 Visitor Log System

A simple **Spring Boot** web application for managing visitor records in an organization.  
The system allows adding and viewing entries with details like name, purpose, and photo.  
It’s lightweight, fast, and can run **locally without complex setup**.

---

## 🚀 Features

- 🧍 Visitor registration (name, purpose, photo, etc.)
- 🗃️ Database auto-creation using JPA/Hibernate
- 🌐 REST API endpoints (easy to test via Postman)
- 💾 Works with **SQLite** (lightweight local use) or **MySQL** (for production)
- ⚙️ Simple configuration — just run the app!

---

## 🏗️ Tech Stack

| Layer | Technology |
|--------|-------------|
| Backend | Spring Boot 3 (Java 17+) |
| Database | SQLite (default) or MySQL |
| ORM | Spring Data JPA + Hibernate |
| API Testing | Postman |
| Build Tool | Maven |

### Clone the repository
```bash
git clone https://github.com/CrushieT/dict-log-system.git
cd dict-log-system
```


### Prerequisites
-------------
1. Java 17+ or Java 23
   - Ensure JAVA_HOME is set and java is in your PATH.
2. Maven
   - Needed to build and run the project.
     Run `mvn -v` to verify installation.
3. mkcert
   - Used to generate trusted local certificates.
   - Installation instructions: https://github.com/FiloSottile/mkcert#installation
4. OpenSSL
   - Needed to convert PEM files to PKCS12 keystore format.
   - Installation instructions: https://www.openssl.org/source/

Step 1 — Install mkcert and create a local CA
---------------------------------------------
1. Install mkcert and run:
   mkcert -install

2. Generate a certificate for localhost, 127.0.0.1, and your LAN IP:
   mkcert localhost 127.0.0.1 

   This will produce:
   - localhost+2.pem (certificate)
   - localhost+2-key.pem (private key)

Step 2 — Convert PEM to PKCS12 keystore
---------------------------------------
Use OpenSSL to create a .p12 keystore for Spring Boot:

   openssl pkcs12 -export -in localhost+2.pem -inkey localhost+2-key.pem -out keystore.p12 -name dictlog -password pass:dict123

- Alias: dictlog
- Password: dict123

(Optional) Delete the .pem files if you don't need them anymore.

Step 3 — Move keystore to resources
-----------------------------------
Move keystore.p12 to the Spring Boot resources directory:

   src/main/resources/

Step 4 — Create environment variables
-------------------------------------


Create a file named .env in root directory:

    # .env
    # Keystore password (leave blank if none)
    SSL_KEYSTORE_PASSWORD=dict123

    # Alias in the keystore
    SSL_KEYSTORE_ALIAS=dictlog


Create a file named set-env.ps1 in root directory:

    # Load environment variables from .env
    Get-Content .env | ForEach-Object {
        # Skip empty lines and comments
        if ($_ -and $_ -notmatch '^\s*#') {
            $pair = $_ -split "="
            if ($pair.Length -eq 2) {
                $name = $pair[0].Trim()
                $value = $pair[1].Trim()
                # Set environment variable for current session
                Set-Item -Path "Env:$name" -Value $value
            }
        }
    }
    Write-Host "Environment variables loaded."


Run the script terminal:

   
    .\set-env.ps1 
    

Step 5 — Configure application.properties
-----------------------------------------
Make sure Spring Boot reads the environment variables:

   ```
    server.ssl.enabled=true
    server.ssl.key-store=classpath:keystore.p12
    server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
    server.ssl.key-store-type=PKCS12
    server.ssl.key-alias=${SSL_KEYSTORE_ALIAS}
   ```

Step 6 — Run the application
----------------------------
After setting up environment variables, start the app:

   mvn spring-boot:run

Open your browser at:
   https://localhost:8080

Both should now be trusted without SSL warnings.

N
