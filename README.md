# HSB Aurora Author Notifier

## Version
This code works for DSpace Version 8.2.0. For DSpace 7 versions, please use the code from the notifier-1.0 tag.

## About
The author notification in DSpace was implemented as part of the AURORA project and co-financed by swissuniversities. The purpose of the notification is to guide authors on how to provide a full text for secondary publication in line with Green Open Access.


In the user interface, the button appearing next to the linked authors and editors can be clicked to generate an e-mail notification. In the backend, metadata from the publication entry is being used to fill in the e-mail template and send the message. The e-mail is sent both to the linked person and to the internal administrator.

### Button for sending the e-mail

<img src="public/assets/img/frontend_author_button.png" alt="author_notification_button" width="500">

### Example of an e-mail template

```
## AURORA notification [EN]
## 
## {0}  Vorname des verlinkten Autors
## {1}  Titel der Publikation
## {2}  Publikationsdatum, nur Jahr
## {3}  DOI
## {4}  Version [Akzeptiertes Autorenmanuskript (AAM) oder Publizierte Verlagsversion]
## {5}  Embargo [Sperrfrist: XX Monate] 
## {6}  Licence [Lizenz: XX]
## {7}  URL [value]
## {8}  Name of the editor (Vorname der bearbeitenden Person in der Qualitätskontrolle)
## {9}  Name of the editor (Vorname und Nachname der bearbeitenden Person in der Qualitätskontrolle)
#set($subject = 'Publication entry with Open Access potential')
Dear ${params[0]}

Using an automatic process, we have found one of your publications and entered it in the ZHAW digitalcollection: 
${params[1]}${params[2]}${params[3]}
The data will be available shortly.

You have the possibility to make this publication Open Access. To do so, you can share the following version in our repository:
${params[4]}${params[5]}${params[6]}
If you have this version or can request it from the corresponding author, please send us the document. We will attach the file to the entry and comply with the necessary conditions so that no rights are violated. Our data basis and further information can be found here: ${params[7]}

If you have any questions or additions to the collected data, please send us a reply to this message. 


Best regards,
${params[8]}

---
${params[9]}
ZHAW digitalcollection
ZHAW | Finance & Services | University Library | digitalcollection@zhaw.ch
www.zhaw.ch/hsb
```


## Table of contents

  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Frontend](#frontend)
    - [Dynamic Lookup extended](#dynamic-lookup-extended)
    - [AuthorNotifier](#authornotifier)
    - [AuthorNotificationService](#authornotificationservice)
    - [DsDynamicFormControlMapFn](#dsdynamicformcontrolmapfn)
  - [Backend](#backend)
    - [E-mail-Template](#email-template)
    - [AuthorNotificationRest](#authornotificationrest)
    - [AuthorMailService](#authormailservice)
    - [OAStatusModel](#oastatusmodel)
    - [Core Services](#core-services)


<a name="prerequisites"/>

## Prerequisites
- DSpace 8.x

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

In the themes folder, the DynamicLookup files from the upper source code are added and personalized. The files are renamed DsDynamicExtendedLookup and inherit from the DsDynamicVocabularyComponent. In the TS file, a new service must be injected, so that the submissionId is known.
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


<a name="dsdynamicformcontrolmapfn"/>

### DsDynamicFormControlMapFn 
- src/app/shared/form/builder/ds-dynamic-form-ui/ds-dynamic-form-control-map-fn.ts 

To use the extended DsDynamicLookupExtendedComponent instead of the standard, it must be linked in the DsDynamicFormControlMapFn.

```
case DYNAMIC_FORM_CONTROL_TYPE_LOOKUP_NAME:
  return DsDynamicLookupExtendedComponent;
```

<a name="backend"/>

## Backend

<a name="email-template"/>

### E-mail-Template
- dspace/config/emails/author_bitstream_request_aurora 
- dspace/config/emails/author_bitstream_request_aurora_de
- dspace/config/emails/author_bitstream_request_aurora_en
- dspace/config/emails/author_bitstream_request_manual
- dspace/config/emails/author_bitstream_request_manual_de
- dspace/config/emails/author_bitstream_request_manual_en

The e-mail template is saved in different languages and contains `${params[0]}` (numbered parameters) to fill the e-mail with dynamic information. There are two templates: one for publications submitted through the AURORA Publication Finder and one for publications submitted manually.

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