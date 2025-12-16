/*
* This file is part of the Aurora Notifier.
*
* (c) ZHAW HSB <apps.hsb@zhaw.ch>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
import {
  NgClass,
  NgForOf,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import {
  NgbDropdown,
  NgbDropdownModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicFormLayoutService,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {
  of as observableOf,
  Subscription,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
} from 'rxjs/operators';
import {
  buildPaginatedList,
  PaginatedList,
} from 'src/app/core/data/paginated-list.model';
import { ConfidenceType } from 'src/app/core/shared/confidence-type';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { VocabularyEntry } from 'src/app/core/submission/vocabularies/models/vocabulary-entry.model';
import { VocabularyService } from 'src/app/core/submission/vocabularies/vocabulary.service';
import { BtnDisabledDirective } from 'src/app/shared/btn-disabled.directive';
import {
  hasValue,
  isEmpty,
  isNotEmpty,
} from 'src/app/shared/empty.util';
import { DsDynamicVocabularyComponent as BaseComponent } from 'src/app/shared/form/builder/ds-dynamic-form-ui/models/dynamic-vocabulary.component';
import { DynamicLookupNameModel } from 'src/app/shared/form/builder/ds-dynamic-form-ui/models/lookup/dynamic-lookup-name.model';
import { FormFieldMetadataValueObject } from 'src/app/shared/form/builder/models/form-field-metadata-value.model';
import { AuthorityConfidenceStateDirective } from 'src/app/shared/form/directives/authority-confidence-state.directive';
import { ObjNgFor } from 'src/app/shared/utils/object-ngfor.pipe';

import { DsAuthorNotifierComponent } from './author-notifier/author-notifier.component';



/**
 * Component representing an extended lookup-name input field
 * 
 * @author Dana Ghousson ZHAW
 * @author Iris Hausmann ZHAW
 */
@Component({
  selector: 'ds-dynamic-lookup-extended',
  styleUrls: ['./dynamic-lookup-extended.component.scss'],
  templateUrl: './dynamic-lookup-extended.component.html',
  imports: [
    TranslateModule,
    NgbTooltipModule,
    NgbDropdownModule,
    AuthorityConfidenceStateDirective,
    FormsModule,
    NgIf,
    NgClass,
    InfiniteScrollModule,
    NgForOf,
    NgTemplateOutlet,
    ObjNgFor,
    BtnDisabledDirective,
    DsAuthorNotifierComponent,
  ],
  standalone: true,
})


export class DsDynamicLookupExtendedComponent extends BaseComponent implements OnDestroy, OnInit {

  @Input() group: UntypedFormGroup;
  @Input() model: any;

  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();

  public editMode = false;
  public firstInputValue = '';
  public secondInputValue = '';
  public loading = false;
  public pageInfo: PageInfo;
  public optionsList: any;

  protected subs: Subscription[] = [];

  constructor(protected vocabularyService: VocabularyService,
              private cdr: ChangeDetectorRef,
              protected layoutService: DynamicFormLayoutService,
              protected validationService: DynamicFormValidationService,
              @Inject('submissionIdProvider') public injectedSubmissionId: string,

  ) {
    super(vocabularyService, layoutService, validationService);
  }

  /**
   * Converts an item from the result list to a `string` to display in the `<input>` field.
   */
  inputFormatter = (x: { display: string }, y: number) => {
    return y === 1 ? this.firstInputValue : this.secondInputValue;
  };

  /**
   * Initialize the component, setting up the init form value
   */
  ngOnInit() {
    if (isNotEmpty(this.model.value)) {
      this.setCurrentValue(this.model.value, true);
    }

    this.subs.push(this.model.valueChanges
      .subscribe((value) => {
        if (isEmpty(value)) {
          this.resetFields();
        } else if (!this.editMode) {
          this.setCurrentValue(this.model.value);
        }
      }));
  }

  /**
   * Check if model value has an authority
   */
  public hasAuthorityValue() {
    return hasValue(this.model.value)
      && typeof this.model.value === 'object'
      && this.model.value.hasAuthority();
  }

  /**
   * Check if current value has an authority
   */
  public hasEmptyValue() {
    return isNotEmpty(this.getCurrentValue());
  }

  /**
   * Clear inputs whether there is no results and authority is closed
   */
  public clearFields() {
    if (this.model.vocabularyOptions.closed) {
      this.resetFields();
    }
  }

  /**
   * Check if edit button is disabled
   */
  public isEditDisabled() {
    return !this.hasAuthorityValue();
  }

  /**
   * Check if input is disabled
   */
  public isInputDisabled() {
    return (this.model.vocabularyOptions.closed && this.hasAuthorityValue() && !this.editMode);
  }

  /**
   * Check if model is instanceof DynamicLookupNameModel
   */
  public isLookupName() {
    return (this.model instanceof DynamicLookupNameModel);
  }

  /**
   * Check if search button is disabled
   */
  public isSearchDisabled() {
    return isEmpty(this.firstInputValue) || this.editMode;
  }

  /**
   * Update model value with the typed text if vocabulary is not closed
   * @param event the typed text
   */
  public onChange(event) {
    event.preventDefault();
    if (!this.model.vocabularyOptions.closed) {
      if (isNotEmpty(this.getCurrentValue())) {
        const currentValue = new FormFieldMetadataValueObject(this.getCurrentValue());
        if (!this.editMode) {
          this.updateModel(currentValue);
        }
      } else {
        this.remove();
      }
    }
  }

  /**
   * Load more result entries
   */
  public onScroll() {
    if (!this.loading && this.pageInfo.currentPage <= this.pageInfo.totalPages) {
      this.updatePageInfo(
        this.pageInfo.elementsPerPage,
        this.pageInfo.currentPage + 1,
        this.pageInfo.totalElements,
        this.pageInfo.totalPages,
      );
      this.search();
    }
  }

  /**
   * Update model value with selected entry
   * @param event the selected entry
   */
  public onSelect(event) {
    this.updateModel(event);
  }

  /**
   * Reset the current value when dropdown toggle
   */
  public openChange(isOpened: boolean) {
    if (!isOpened) {
      if (this.model.vocabularyOptions.closed && !this.hasAuthorityValue()) {
        this.setCurrentValue('');
      }
    }
  }

  /**
   * Reset the model value
   */
  public remove() {
    this.group.markAsPristine();
    this.dispatchUpdate(null);
  }

  /**
   * Saves all changes
   */
  public saveChanges() {
    if (isNotEmpty(this.getCurrentValue())) {
      const newValue = Object.assign(new VocabularyEntry(), this.model.value, {
        display: this.getCurrentValue(),
        value: this.getCurrentValue(),
      });
      this.updateModel(newValue);
    } else {
      this.remove();
    }
    this.switchEditMode();
  }

  /**
   * Converts a stream of text values from the `<input>` element to the stream of the array of items
   * to display in the result list.
   */
  public search() {
    this.optionsList = null;
    this.updatePageInfo(this.model.maxOptions, 1);
    this.loading = true;

    this.subs.push(this.vocabularyService.getVocabularyEntriesByValue(
      this.getCurrentValue(),
      false,
      this.model.vocabularyOptions,
      this.pageInfo,
    ).pipe(
      getFirstSucceededRemoteDataPayload(),
      catchError(() =>
        observableOf(buildPaginatedList(
          new PageInfo(),
          [],
        )),
      ),
      distinctUntilChanged())
      .subscribe((list: PaginatedList<VocabularyEntry>) => {
        this.optionsList = list.page;
        this.updatePageInfo(
          list.pageInfo.elementsPerPage,
          list.pageInfo.currentPage,
          list.pageInfo.totalElements,
          list.pageInfo.totalPages,
        );
        this.loading = false;
        this.cdr.detectChanges();
      }));
  }

  /**
   * Changes the edit mode flag
   */
  public switchEditMode() {
    this.editMode = !this.editMode;
  }

  /**
   * Callback functions for whenClickOnConfidenceNotAccepted event
   */
  public whenClickOnConfidenceNotAccepted(sdRef: NgbDropdown, confidence: ConfidenceType) {
    if (!this.model.readOnly) {
      sdRef.open();
      this.search();
    }
  }

  ngOnDestroy() {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

  /**
   * Sets the current value with the given value.
   * @param value The value to set.
   * @param init Representing if is init value or not.
   */
  public setCurrentValue(value: any, init = false) {
    if (init) {
      this.getInitValueFromModel()
        .subscribe((formValue: FormFieldMetadataValueObject) => this.setDisplayInputValue(formValue.display));
    } else if (hasValue(value)) {
      if (value instanceof FormFieldMetadataValueObject || value instanceof VocabularyEntry) {
        /**
         * ZHAW: this.setDisplayInputValue(value.display);
         * change to value.value, because the display name must not be entered in the name field, but the value to be saved must go in here
         */
        this.setDisplayInputValue(value.value);

      }
    }
  }

  protected setDisplayInputValue(displayValue: string) {
    if (hasValue(displayValue)) {
      if (this.isLookupName()) {
        const values = displayValue.split((this.model as DynamicLookupNameModel).separator);

        this.firstInputValue = (values[0] || '').trim();
        this.secondInputValue = (values[1] || '').trim();
      } else {
        this.firstInputValue = displayValue || '';
      }
      this.cdr.detectChanges();
    }
  }

  /**
   * Gets the current text present in the input field(s)
   */
  protected getCurrentValue(): string {
    let result = '';
    if (!this.isLookupName()) {
      result = this.firstInputValue;
    } else {
      if (isNotEmpty(this.firstInputValue)) {
        result = this.firstInputValue;
      }
      if (isNotEmpty(this.secondInputValue)) {
        result = isEmpty(result)
          ? this.secondInputValue
          : this.firstInputValue + (this.model as DynamicLookupNameModel).separator + ' ' + this.secondInputValue;
      }
    }
    return result;
  }

  /**
   * Clear text present in the input field(s)
   */
  protected resetFields() {
    this.firstInputValue = '';
    if (this.isLookupName()) {
      this.secondInputValue = '';
    }
  }

  protected updateModel(value) {
    this.group.markAsDirty();
    this.dispatchUpdate(value);
    this.setCurrentValue(value);
    this.optionsList = null;
    this.pageInfo = null;
  }




}
