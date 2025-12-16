/*
* This file is part of the Aurora Notifier.
*
* (c) ZHAW HSB <apps.hsb@zhaw.ch>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
import { NgIf } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  NgbModal,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicFormLayoutService,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  take,
  tap,
} from 'rxjs';
import { RemoteData } from 'src/app/core/data/remote-data';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { Registration } from 'src/app/core/shared/registration.model';
import { SubmissionScopeType } from 'src/app/core/submission/submission-scope-type';
import { BtnDisabledDirective } from 'src/app/shared/btn-disabled.directive';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { hasValue } from 'src/app/shared/empty.util';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { SubmissionService } from 'src/app/submission/submission.service';
import { AuthorNotificationService } from 'src/themes/zhaw/app/core/data/author-notification.service';

export const TYPE_REQUEST_AUTHORMAIL = 'author_bitstream_request';


/**
 * Component representing a button to send mails
 * 
 * @author Dana Ghousson ZHAW
 * @author Iris Hausmann ZHAW
 */
@Component({
  selector: 'ds-author-notifier',
  templateUrl: './author-notifier.component.html',
  standalone: true,
  imports: [BtnDisabledDirective, NgbTooltipModule, TranslateModule, NgIf],
})

export class DsAuthorNotifierComponent implements OnInit {


  @Input() public modelValue;
  @Input() public submissionId;

  isWorkflow = false;



  constructor(
    protected layoutService: DynamicFormLayoutService,
    protected validationService: DynamicFormValidationService,
    private submissionService: SubmissionService,
    private notificationsService: NotificationsService,
    private authorNotificationService: AuthorNotificationService,
    private translateService: TranslateService,
    private modalService: NgbModal,
  ) {
  }

  /**
   * Initialize the component, setting up the init form value
   */
  ngOnInit() {

    this.isWorkflow = this.submissionService.getSubmissionScope() === SubmissionScopeType.WorkflowItem;

  }


  /**
     * Check if model value has an authority
     */
  public hasAuthorityValue() {
    return hasValue(this.modelValue)
      && typeof this.modelValue === 'object'
      && this.modelValue.hasAuthority();
  }


  /**
   * After clicking on mail button
   */
  onButtonClick(): void {

    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.headerLabel = 'confirmation-modal.send-author-mail.header';
    modalRef.componentInstance.infoLabel = 'confirmation-modal.send-author-mail.info';
    modalRef.componentInstance.cancelLabel = 'confirmation-modal.send-author-mail.cancel';
    modalRef.componentInstance.confirmLabel = 'confirmation-modal.send-author-mail.confirm';
    modalRef.componentInstance.brandColor = 'warning';
    modalRef.componentInstance.confirmIcon = 'fas fa-paper-plane';

    return modalRef.componentInstance.response.pipe(
      take(1),
      tap((confirm: boolean) => {
        if (confirm) {
          this.sendEmailToAuthor(this.modelValue.authority + '@zhaw.ch');
        }
      }),
    ).subscribe();


  }


  /**
   * Send an email to the author
   * @param authorEmail
   */
  sendEmailToAuthor(authorEmail) {

    this.authorNotificationService.registerEmail(authorEmail, this.modelValue.value, this.submissionId, TYPE_REQUEST_AUTHORMAIL).pipe(getFirstCompletedRemoteData())
      .subscribe((response: RemoteData<Registration>) => {
        if (response.hasSucceeded) {
          this.notificationsService.success(this.translateService.get('author.notifier.success.head'),
            this.translateService.get('author.notifier.success.content', { email: authorEmail }));
        } else {
          this.notificationsService.error(this.translateService.get('author.notifier.error.head'),
            this.translateService.get('author.notifier.error.content', { email: authorEmail }));
        }
      },
      );

  }




}
