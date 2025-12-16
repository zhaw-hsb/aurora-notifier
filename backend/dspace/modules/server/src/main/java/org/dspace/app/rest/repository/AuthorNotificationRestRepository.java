/*
* This file is part of the Aurora Notifier.
*
* (c) ZHAW HSB <apps.hsb@zhaw.ch>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
package org.dspace.app.rest.repository;


import java.io.IOException;
import java.sql.SQLException;
import jakarta.mail.MessagingException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.zhaw.digitalcollection.authority.aurora.service.AuthorMailService;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.dspace.app.rest.exception.RepositoryMethodNotImplementedException;
import org.dspace.app.rest.exception.UnprocessableEntityException;
import org.dspace.app.rest.model.AuthorNotificationRest;
import org.dspace.authorize.AuthorizeException;
import org.dspace.core.Context;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Component;

/**
 * This class treats the rest call to the endpoint.
 * 
 * @author Dana Ghousson ZHAW
 * @author Iris Hausmann ZHAW
 */
@Component(AuthorNotificationRest.CATEGORY + "." + AuthorNotificationRest.NAME_PLURAL)
public class AuthorNotificationRestRepository extends DSpaceRestRepository<AuthorNotificationRest, Integer> {

    private static Logger log = LogManager.getLogger(AuthorNotificationRestRepository.class);

    public static final String TYPE_QUERY_PARAM = "requestType";
    public static final String TYPE_QUERY_PARAM2 = "authorName";
    public static final String TYPE_QUERY_PARAM3 = "submissionId";
    public static final String TYPE_REQUEST_AUTHORMAIL = "author_bitstream_request";


    @Autowired
    private AuthorMailService authorMailService;

    @Override
    public AuthorNotificationRest findOne(Context context, Integer integer) {
        throw new RepositoryMethodNotImplementedException("No implementation found; Method not allowed!", "");
    }

    @Override
    public Page<AuthorNotificationRest> findAll(Context context, Pageable pageable) {
        throw new RepositoryMethodNotImplementedException("No implementation found; Method not allowed!", "");
    }


    @Override
    public AuthorNotificationRest createAndReturn(Context context) {

        HttpServletRequest request = requestService.getCurrentRequest().getHttpServletRequest();
        ObjectMapper mapper = new ObjectMapper();
        AuthorNotificationRest authorNotificationRest;
        String type = request.getParameter(TYPE_QUERY_PARAM);
        String authorName = request.getParameter(TYPE_QUERY_PARAM2);
        String submissionId = request.getParameter(TYPE_QUERY_PARAM3);


        if (StringUtils.isBlank(type) ||
            (!type.equalsIgnoreCase(TYPE_REQUEST_AUTHORMAIL) )) {
            throw new IllegalArgumentException(String.format("Needs query param '%s' with value %s indicating " +
                "what kind of author request it is", TYPE_QUERY_PARAM, TYPE_REQUEST_AUTHORMAIL));
        }

        if(authorName == null){
            throw new IllegalArgumentException(String.format("Needs query param '%s' with a authorName value", TYPE_QUERY_PARAM2));
        }

        if(submissionId == null){
            throw new IllegalArgumentException(String.format("Needs query param '%s' with a submissionId value", TYPE_QUERY_PARAM3));
        }
     
        try {
            ServletInputStream input = request.getInputStream();
            authorNotificationRest = mapper.readValue(input, AuthorNotificationRest.class);
        
        } catch (IOException e1) {
            throw new UnprocessableEntityException("Error parsing request body.", e1);
        }
        if (StringUtils.isBlank(authorNotificationRest.getEmail())) {
            throw new UnprocessableEntityException("The email cannot be omitted from the author-notification endpoint");
        }
     
        if (type.equalsIgnoreCase(TYPE_REQUEST_AUTHORMAIL)) {
            try {

                authorMailService.sendBitstreamRequest(context, authorNotificationRest.getEmail(), authorName, submissionId);
            } catch (SQLException | IOException | MessagingException | AuthorizeException e) {
                log.error("Something went wrong with sending author bitstream request email: "
                              + authorNotificationRest.getEmail(), e);
            }
        }

        return null;
    }

    @Override
    public Class<AuthorNotificationRest> getDomainClass() {
        return AuthorNotificationRest.class;
    }


}
