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
