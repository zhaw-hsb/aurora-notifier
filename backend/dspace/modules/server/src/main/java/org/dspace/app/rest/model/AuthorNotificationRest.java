/*
* This file is part of the Aurora Notifier.
*
* (c) ZHAW HSB <apps.hsb@zhaw.ch>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
package org.dspace.app.rest.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.dspace.app.rest.RestResourceController;



/**
 * This class is a model of the rest endpoint.
 * 
 * @author Dana Ghousson ZHAW
 * @author Iris Hausmann ZHAW
 */
public class AuthorNotificationRest extends RestAddressableModel {

    public static final String NAME = "author-notification";
    public static final String NAME_PLURAL = "author-notifications";
    public static final String CATEGORY = EPERSON;

    private String email;

    /**
     * Generic getter for the email
     * @return the email value of this RegisterRest
     */
    public String getEmail() {
        return email;
    }

    /**
     * Generic setter for the email
     * @param email   The email to be set on this RegisterRest
     */
    public void setEmail(String email) {
        this.email = email;
    }


    @Override
    public String getCategory() {
        return CATEGORY;
    }

    @Override
    public Class getController() {
        return RestResourceController.class;
    }

    @Override
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getType() {
        return NAME;
    }
}
