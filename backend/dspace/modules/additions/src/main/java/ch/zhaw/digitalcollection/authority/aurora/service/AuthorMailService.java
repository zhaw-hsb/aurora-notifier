/*
* This file is part of the Aurora Notifier.
*
* (c) ZHAW HSB <apps.hsb@zhaw.ch>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
package ch.zhaw.digitalcollection.authority.aurora.service;


import java.io.IOException;
import java.sql.SQLException;
import javax.mail.MessagingException;

import org.dspace.authorize.AuthorizeException;
import org.dspace.core.Context;

/**
 * This interface defines characteristics of a author mail service
 * 
 * @author Dana Ghousson ZHAW
 * @author Iris Hausmann ZHAW
 */
public interface AuthorMailService {

    public void sendBitstreamRequest(Context context, String email, String authorName, String submissionId)
        throws SQLException, IOException, MessagingException, AuthorizeException;
}
