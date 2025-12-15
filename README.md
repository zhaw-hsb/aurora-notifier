# HSB Aurora Author Notifier

## Version
This code works for DSpace Version 7.6.0.

## About
The author notification in DSpace was implemented as part of the AURORA project and co-financed by swissuniversities. The purpose of the notification is to guide authors on how to provide a full text for secondary publication in line with Green Open Access.


In the user interface, the button appearing next to the linked authors and editors can be clicked to generate an e-mail notification. In the backend, metadata from the publication entry is being used to fill in the e-mail template and send the message. The e-mail is sent both to the linked person and to the internal administrator.

### Button for sending the e-mail

<img src="public/assets/img/frontend_author_button.png" alt="author_notification_button" width="500">

### Example of an e-mail template

```
# AURORA notification [DE]
# 
# {0}  Name of contacted author (Vorname = Wert hinter dem Komma)
# {1}  Title of submission
# {2}  Publication date of submission
# {3}  DOI of submission
# {4}  Version [Akzeptiertes Autorenmanuskript (AAM) oder Publizierte Verlagsversion]
# {5}  Embargo [Sperrfrist: XX Monate] 
# {6}  Licence [Lizenz: XX]
# {7}  URL [value]
# {8}  Name of the editor (Vorname der bearbeitenden Person in der Qualitätskontrolle - ist das machbar? Sonst weglassen)
#

Subject: Publikationsnachweis mit Open-Access-Potential

Guten Tag ${params[0]}

Über einen automatischen Prozess haben wir eine deiner Publikationen gefunden und in der ZHAW digitalcollection als Eintrag erfasst:

${params[1]} ${params[2]}
${params[3]}

Die Daten werden in Kürze verfügbar sein.

Du hast die Möglichkeit, eine Zweitveröffentlichung dieser Publikation im Open Access frei zugänglich zu machen. Dafür kannst du die folgende Version in der ZHAW digitalcollection teilen:
${params[4]}${params[5]}${params[6]}
Wenn du diese Version des Beitrags hast oder vom Corresponding Author bekommen kannst, dann schicke uns gerne das Dokument zu. Wir werden die Datei an den Eintrag anhängen und dabei die erforderlichen Bedingungen einhalten, damit keine Rechte verletzt werden. Unsere Datengrundlage und weitere Informationen sind hier zu finden: ${params[7]}

Sende uns Fragen oder Ergänzungen in Bezug auf die erfassten Daten gern als Antwort auf diese Nachricht. 


Freundliche Grüsse
${params[8]}

ZHAW Hochschulbibliothek
digitalcollection@zhaw.ch
```


## Table of contents

  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Frontend](#frontend)
    - [Dynamic Lookup extended](#dynamic-lookup-extended)
    - [AuthorNotifier](#authornotifier)
    - [AuthorNotificationService](#authornotificationservice)
    - [DsDynamicFormControlContainer](#dsdynamicformcontrolcontainer)
    - [Eager Theme Module](#eager-theme-module)
    - [ZHAW Shared Components](#zhaw-shared-components)
  - [Backend](#backend)
    - [E-mail-Template](#email-template)
    - [AuthorNotificationRest](#authornotificationrest)
    - [AuthorMailService](#authormailservice)
    - [OAStatusModel](#oastatusmodel)
    - [Core Services](#core-services)


<a name="prerequisites"/>

## Prerequisites
- DSpace 7.x

<a name="installation"/>

## Installation
- Transfer files to the DSpace repository (back- and frontend customisations)

<a name="frontend"/>

## Frontend

This chapter explains the implementation of the functionality for e-mail notification in the user interface of the workflow.

<a name="dynamic-lookup-extended"/>

### Dynamic Lookup extended
- src/themes/zhaw/app/zhaw-shared/form/builder/ds-dynamic-form-ui/models/lookup/dynamic-lookup-extended.component.html
- src/themes/zhaw/app/zhaw-shared/form/builder/ds-dynamic-form-ui/models/lookup/dynamic-lookup-extended.component.ts
- src/themes/zhaw/app/zhaw-shared/form/builder/ds-dynamic-form-ui/models/lookup/dynamic-lookup-extended.component.scss 

In the themes folder, the DynamicLookup files from the upper source code are added and personalized. The files are renamed DsDynamicExtendedLookup and inherit from the DsDynamicLookup. In the TS file, a new service must be injected, so that the submissionId is known.
```
@Inject('submissionIdProvider') public injectedSubmissionId: string
```

The HTML is extended with the AuthorNotifier component, which implements the e-mail button.
```
<ds-author-notifier [submissionId]="injectedSubmissionId" [modelValue]="model.value"></ds-author-notifier>  
```

<a name="authornotifier"/>

### AuthorNotifier
- src/themes/zhaw/app/zhaw-shared/form/builder/ds-dynamic-form-ui/models/lookup/author-notifier/author-notifier.component.ts
- src/themes/zhaw/app/zhaw-shared/form/builder/ds-dynamic-form-ui/models/lookup/author-notifier/author-notifier.component.html

A new component is created in the themes folder, which implements the e-mail button. The button is only visible if a person (author or editor) is linked and if the item is in the workflow. After pressing the button, a confirmation window opens in which the execution of the action can be confirmed.

<a name="authornotificationservice"/>

### AuthorNotificationService 
- src/themes/zhaw/app/core/data/author-notification.service.ts 

In this file the service is implemented to send the information to the backend after the button has been pressed. The information provided is
- the requestType: type of mail
- the authorName: name of the linked person
- the submissionId: id of the item that is in the workflow


<a name="dsdynamicformcontrolcontainer"/>

### DsDynamicFormControlContainer 
- src/app/shared/form/builder/ds-dynamic-form-ui/ds-dynamic-form-control-container.component.ts 

To use the extended DsDynamicLookupExtendedComponent instead of the standard, it must be linked in the DsDynamicFormControlContainer.

```
case DYNAMIC_FORM_CONTROL_TYPE_LOOKUP_NAME:
  return DsDynamicLookupExtendedComponent;
```

<a name="eager-theme-module"/>

### Eager Theme Module 
- src/themes/zhaw/eager-theme.module.ts 

A new import "FormModule" must be made in the Eager Theme Module, so that the Dynamic Lookup Extended HTML runs.

<a name="zhaw-shared-components"/>

### ZHAW Shared Components
- src/themes/zhaw/app/zhaw-shared/zhaw-shared.components.ts

The new components declared in the Eager Theme Module are mentioned in the ZHAW Shared Components. The components: 
- DsAuthorNotifierComponent
- DsDynamicLookupExtendedComponent

<a name="backend"/>

## Backend

<a name="email-template"/>

### E-mail-Template
- dspace/config/emails/author_bitstream_request 
- dspace/config/emails/author_bitstream_request_de
- dspace/config/emails/author_bitstream_request_en

The e-mail template is saved in different languages and contains `${params[0]}` (numbered parameters) to fill the e-mail with dynamic information.

<a name="authornotificationrest"/>

### AuthorNotificationRest
- dspace/modules/server/src/main/java/org/dspace/app/rest/model/AuthorNotificationRest.java
- dspace/modules/server/src/main/java/org/dspace/app/rest/repository/AuthorNotificationRestRepository.java 

The AuthorNotificationRest class is a model to store the information from the AuthorNotificationRestRepository. The author's e-mail is mainly stored here.

The query from the frontend is intercepted in the AuthorNotificationRestRepository. If the values are correct, the information is forwarded to the AuthorMailService.

<a name="authormailservice"/>

### AuthorMailService
- dspace/modules/additions/src/main/java/ch/zhaw/digitalcollection/authority/aurora/AuthorMailServiceImpl.java
- dspace/modules/additions/src/main/java/ch/zhaw/digitalcollection/authority/aurora/service/AuthorMailService.java

An AuthorMailService is implemented to fill the e-mail template with the required information and send the e-mail. The information is transformed in such a way that it optimally matches the template. They are added to the e-mail object in the same order as in the template.

<a name="oastatusmodel"/>

### OAStatusModel
- dspace/modules/additions/src/main/java/ch/zhaw/digitalcollection/authority/aurora/service/OAStatusModel.java

A model for filling the e-mail information. Here, for example, the information from an internal field is processed for the requirements for secondary publication.

<a name="core-services"/>

### Core Services 
- dspace/config/spring/api/core-services.xml
```
<bean class="ch.zhaw.digitalcollection.authority.aurora.AuthorMailServiceImpl"/>
```
The implementation of the AuthorMailService is recorded as an entry in the Core Services XML.