<#--
  This file has been claimed for ownership from @keycloakify/email-native version 260007.0.0.
  To relinquish ownership and restore this file to its original content, run the following command:
  
  $ npx keycloakify own --path "email/html/template.ftl" --revert
-->

<#-- Brand colors duplicated from src/shared/brand-tokens.css as literal hex values.
     Email clients have unreliable support for CSS custom properties, so these
     must be kept in sync by hand if the tokens ever change:
       --color-bg: #1b1b1b
       --color-surface: #242424
       --color-border: #333333
       --color-text: #f5f5f5
       --color-accent-text: #5c8ee8 (use for links on the dark background; #296bd8 alone is 3.44:1, fails WCAG AA for text)
-->
<#macro emailLayout>
<html lang="en">
<head>
<meta charset="utf-8">
<style>a, a:link, a:visited { color:#5c8ee8 !important; }</style>
</head>
<body style="margin:0; padding:0; background-color:#1b1b1b;">
<div style="background-color:#1b1b1b; padding:32px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px; margin:0 auto; background-color:#242424; border:1px solid #333333; border-radius:8px; padding:32px; color:#f5f5f5;">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAABgCAYAAABsS6soAAABEUlEQVR42u3UQREAAAQAQXVkU1gbchj72AL3uMjqAfgoRAAMEMAAAQwQwAABDBDAAAEMEMAAAQwQwAABDBDAAAEMEMAAAQwQwAABDBDAAAEMEMAAAQwQwAABDBDAAAEMEMAAAQwQwAABAxQCMEAAAwQwQAADBDBAAAMEMEAAAwQwQAADBDBAAAMEMEAAAwQwQAADBDBAAAMEMEAAAwQwQAADBDBAAAMEMEAAAwQwQAADBAwQwAABDBDAAAEMEMAAAQwQwAABDBDAAAEMEMAAAQwQwAABDBDAAAEMEMAAAQwQwAABDBDAAAEMEMAAAQwQwAABDBDAAAEDFAEwQAADBDBAAAMEMEAAAwQwQAADBLhmAcQDOP/z0q7uAAAAAElFTkSuQmCC" alt="eliferpg" style="max-width:120px; margin-bottom:24px;" />
    <div style="color:#f5f5f5;">
        <#nested>
    </div>
  </div>
</div>
</body>
</html>
</#macro>
