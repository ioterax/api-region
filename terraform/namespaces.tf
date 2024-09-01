resource "kubernetes_namespace" "laniakea-central" {
  metadata {
    name = "laniakea-central"
  }
}


# locals {
#   # Reading the configs from yaml file
#   # The file is in the same directory
#   firewall_configs = yamldecode(file("${path.module}/firewall.yaml"))
# }

# output "log" {
#   value = file("${path.module}/k8s/laniakea-mcs-central-deploy.yml")
# }

