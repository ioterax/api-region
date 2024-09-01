terraform {
  backend "local" {}
  # required_providers {
  #   kubectl = {
  #     source  = "gavinbunney/kubectl"
  #   }
  # }
}


# local dev purposes only
resource "kubernetes_manifest" "deploy-mcs-region" {
    depends_on = [ kubernetes_namespace.laniakea-central ]
    manifest = yamldecode(file("${path.module}/k8s/laniakea-mcs-region-deploy.yml"))
}







resource "kubernetes_manifest" "service-mcs-central" {
    depends_on = [ kubernetes_namespace.laniakea-central ]
    manifest = yamldecode(file("${path.module}/k8s/laniakea-mcs-central-service.yml"))
}







# terraform fmt -recursive && terraform validate
# terraform plan
# terraform apply --auto-approve





