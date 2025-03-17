/*
* This file is part of the Aurora Notifier.
*
* (c) ZHAW HSB <apps.hsb@zhaw.ch>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { find, map } from 'rxjs/operators';

import { HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { RemoteDataBuildService } from 'src/app/core/cache/builders/remote-data-build.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { PostRequest } from 'src/app/core/data/request.models';
import { RequestService } from 'src/app/core/data/request.service';
import { HttpOptions } from 'src/app/core/dspace-rest/dspace-rest.service';
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { Registration } from 'src/app/core/shared/registration.model';
import { hasValue } from 'src/app/shared/empty.util';

@Injectable({
  providedIn: 'root',
})
/**
 * Service that will register a new email address and request a token
 * 
 * @author Dana Ghousson ZHAW
 * @author Iris Hausmann ZHAW
 */
export class AuthorNotificationService {

  protected linkPath = 'author-notifications';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected halService: HALEndpointService,
  ) {

  }

  /**
   * Retrieves the Registration endpoint
   */
  getRegistrationEndpoint(): Observable<string> {
    return this.halService.getEndpoint(this.linkPath);
  }

  /**
   * Register a new email address
   * @param email
   */
  registerEmail(email: string, authorName: string,submissionId: string, type: string): Observable<RemoteData<Registration>> {

    const registration = new Registration();
    registration.email = email;

    const requestId = this.requestService.generateRequestId();

    const href$ = this.getRegistrationEndpoint();

    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    options.headers = headers;


    if (hasValue(type)) {
      options.params = type ?
        new HttpParams({ fromString: 'requestType=' + type + '&authorName=' + authorName + '&submissionId=' + submissionId }) : new HttpParams();
    }

    href$.pipe(
      find((href: string) => hasValue(href)),
      map((href: string) => {
        const request = new PostRequest(requestId, href, registration, options);
        this.requestService.send(request);
      })
    ).subscribe();

    return this.rdbService.buildFromRequestUUID<Registration>(requestId).pipe(
      getFirstCompletedRemoteData()
    );
  }


}
