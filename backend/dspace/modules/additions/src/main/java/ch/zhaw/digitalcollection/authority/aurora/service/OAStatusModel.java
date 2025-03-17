/*
* This file is part of the Aurora Notifier.
*
* (c) ZHAW HSB <apps.hsb@zhaw.ch>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
package ch.zhaw.digitalcollection.authority.aurora.service;

/**
 * This class is a model of the oa status data
 * 
 * @author Dana Ghousson ZHAW
 * @author Iris Hausmann ZHAW
 */
public class OAStatusModel {

    String version = "";
    String embargo = "";
    String licence = "";
    String url = "";

    
    public String getVersion() {
        return version;
    }
    public void setVersion(String version) {
        this.version = version;
    }
    public String getEmbargo() {
        return embargo;
    }
    public void setEmbargo(String embargo) {
        this.embargo = embargo;
    }
    public String getLicence() {
        return licence;
    }
    public void setLicence(String licence) {
        this.licence = licence;
    }
    public String getUrl() {
        return url;
    }
    public void setUrl(String url) {
        this.url = url;
    }

    

    
}
