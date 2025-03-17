/*
* This file is part of the Aurora Notifier.
*
* (c) ZHAW HSB <apps.hsb@zhaw.ch>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DynamicFormLayoutService, DynamicFormValidationService } from '@ng-dynamic-forms/core';
import { VocabularyService } from 'src/app/core/submission/vocabularies/vocabulary.service';
import { DsDynamicLookupComponent } from 'src/app/shared/form/builder/ds-dynamic-form-ui/models/lookup/dynamic-lookup.component';


/**
 * Component representing an extended lookup-name input field
 * 
 * @author Dana Ghousson ZHAW
 * @author Iris Hausmann ZHAW
 */
@Component({
  selector: 'ds-dynamic-lookup-extended',
  styleUrls: ['./dynamic-lookup-extended.component.scss'],
  templateUrl: './dynamic-lookup-extended.component.html'
})

export class DsDynamicLookupExtendedComponent extends DsDynamicLookupComponent implements OnDestroy, OnInit {

  constructor(protected vocabularyService: VocabularyService,
              cdr: ChangeDetectorRef,
              protected layoutService: DynamicFormLayoutService,
              protected validationService: DynamicFormValidationService,
              @Inject('submissionIdProvider') public injectedSubmissionId: string

  ) {
    super(vocabularyService, cdr, layoutService, validationService);
  }



}
