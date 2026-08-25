FROM quay.io/keycloak/keycloak:26.0
COPY dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar /opt/keycloak/providers/
