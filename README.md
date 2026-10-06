# ShopSphere — Microservices E-Commerce Platform

ShopSphere is a containerized microservices-based e-commerce application deployed on **Amazon EKS** using Docker, Kubernetes, Jenkins CI/CD, GitOps, and AWS Application Load Balancer.

The project demonstrates an end-to-end DevOps workflow covering **containerization, CI/CD, Kubernetes orchestration, AWS infrastructure, path-based routing, security scanning, GitOps deployment, and application troubleshooting**.

 Architecture:

                         Internet
                            │
                            ▼
                 ┌─────────────────────┐
                 │   AWS ALB / Ingress │
                 │    Port 80 / HTTP   │
                 └──────────┬──────────┘
                            │
                   Path-based routing
                       ┌────┴────┐
                       │         │
                      /         /api
                       │         │
                       ▼         ▼
                 ┌──────────┐ ┌──────────────┐
                 │ Frontend │ │ API Gateway  │
                 └──────────┘ └───────┬──────┘
                                      │
                   ┌──────────────────┼──────────────────┐
                   │        │         │        │         │
                   ▼        ▼         ▼        ▼         ▼
                 User    Product     Cart    Order    Payment
                Service  Service    Service  Service  Service
                   │        │         │        │         │
                   └────────┴─────────┴────────┴─────────┘
                                      │
                                      ▼
                                  ┌───────┐
                                  │ MySQL │
                                  └───────┘
```

## 🚀 DevOps Architecture


Developer
    │
    ▼
 GitHub
    │
    ▼
 Jenkins CI/CD
    │
    ├── Checkout Source
    ├── Install Dependencies
    ├── SonarQube Analysis
    ├── Trivy Security Scan
    ├── Docker Build
    └── Docker Push
             │
             ▼
        Docker Registry
             │
             ▼
          Argo CD
             │
             ▼
        Amazon EKS
             │
             ▼
    AWS Load Balancer Controller
             │
             ▼
        Application ALB
```

## 🧩 Application Components

The application consists of multiple containerized services:

| Component       | Description                          |
| --------------- | ------------------------------------ |
| Frontend        | User-facing web application          |
| API Gateway     | Entry point for backend API requests |
| User Service    | User-related operations              |
| Product Service | Product and category management      |
| Cart Service    | Shopping cart operations             |
| Order Service   | Order management                     |
| Payment Service | Payment-related operations           |
| MySQL           | Application database                 |

## ☁️ AWS Infrastructure

The application is deployed on:

* **Amazon EKS** — Kubernetes container orchestration
* **Application Load Balancer** — Internet-facing application entry point
* **AWS Load Balancer Controller** — Kubernetes-to-ALB integration
* **EC2** — Kubernetes worker nodes
* **Amazon ECR / Docker Hub** — Container image registry

## ☸️ Kubernetes

Kubernetes is used to manage:

* Deployments
* Services
* Pod scheduling
* Application configuration
* Service discovery
* Health checks
* Load balancing
* Horizontal scaling
* Application routing

The application is deployed into the `shopsphere` namespace.

### Path-Based Routing

The AWS Application Load Balancer uses Kubernetes Ingress rules:

```text
/       → Frontend Service
/api    → API Gateway Service
```

The API Gateway then routes requests to the appropriate backend service:

```text
/api/users      → User Service
/api/products   → Product Service
/api/categories → Product Service
/api/cart       → Cart Service
/api/orders     → Order Service
/api/payments   → Payment Service
```

This allows the frontend and backend APIs to be accessed through the same ALB endpoint.

## 🔄 CI/CD Pipeline

The Jenkins pipeline automates the application delivery process:

GitHub
   │
   ▼
Jenkins
   │
   ├── Source Checkout
   ├── Dependency Installation
   ├── SonarQube Code Analysis
   ├── Trivy Image Security Scan
   ├── Docker Image Build
   └── Docker Image Push
            │
            ▼
        Container Registry
            │
            ▼
          Argo CD
            │
            ▼
         Amazon EKS

## 🗄️ Database

The application uses **MySQL** for persistent application data.

The database contains tables for areas such as:

```text
users
products
categories
carts
cart_items
orders
order_items
payments
addresses
```

## 🛠️ Technology Stack

### Cloud & Infrastructure

* AWS
* Amazon EKS
* EC2
* VPC
* Application Load Balancer
* AWS Load Balancer Controller
* Terraform

### Containers & Orchestration

* Docker
* Kubernetes

### CI/CD & DevOps

* Jenkins
* Argo CD
* Git
* GitHub
* SonarQube

### Application & Database

* Node.js
* MySQL
* REST APIs

### Operating System & Scripting

* Linux
* Bash
* Python

## 📁 Repository Structure

```text
ShopSphere-Microservice-E-commerce-App/
│
├── frontend/
│
├── services/
│   ├── api-gateway/
│   ├── user-service/
│   ├── product-service/
│   ├── cart-service/
│   ├── order-service/
│   └── payment-service/
│
├── k8s/
│   ├── api-gateway-deployment.yaml
│   ├── user-deployment.yaml
│   ├── product-deployment.yaml
│   ├── cart-deployment.yaml
│   ├── order-deployment.yaml
│   ├── payment-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mysql-deployment.yaml
│   ├── services.yaml
│   └── ingress.yaml
│
├── terraform/
│
├── Jenkinsfile
│
└── README.md
```

##  Key Learning Outcomes

Through this project, I gained hands-on experience with:

* Deploying multi-service applications on Amazon EKS
* Containerizing applications with Docker
* Designing Kubernetes Deployments and Services
* Implementing AWS ALB path-based routing
* Configuring AWS Load Balancer Controller
* Building CI/CD pipelines with Jenkins
* Integrating SonarQube and Trivy into CI/CD
* Implementing GitOps with Argo CD
* Managing infrastructure with Terraform
* Troubleshooting Kubernetes and AWS networking issues
* Implementing application health checks
* Working with MySQL inside Kubernetes


DevOps Engineer | AWS | Kubernetes | Docker | Terraform | Jenkins | CI/CD
