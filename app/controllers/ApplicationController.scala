package controllers

import java.util.UUID
import java.util.concurrent.TimeoutException
import javax.inject.{Singleton, Inject}

import com.mohiva.play.silhouette.api.{ Environment, LogoutEvent, Silhouette }
import com.mohiva.play.silhouette.impl.authenticators.JWTAuthenticator
import com.mohiva.play.silhouette.impl.providers.SocialProviderRegistry
import models._
import models.daos.{RegistrationDAO, OfferDAO, PartnerDAO, ClazzDAO}
import play.Play
import play.api.Logger
import play.api.cache.Cache
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.Play.current
import scala.concurrent.duration._

import scala.concurrent.{Await, Future}

/**
 * The basic application controller.
 *
 * @param messagesApi The Play messages API.
 * @param env The Silhouette environment.
 * @param socialProviderRegistry The social provider registry.
 */
@Singleton
class ApplicationController @Inject()(
                                       val messagesApi: MessagesApi,
                                       val env: Environment[Partner, JWTAuthenticator],
                                       socialProviderRegistry: SocialProviderRegistry,
                                       clazzDAO: ClazzDAO,
                                       partnerDAO: PartnerDAO,
                                       offerDAO: OfferDAO)
  extends Silhouette[Partner, JWTAuthenticator] {


  def offers = UserAwareAction.async { implicit request =>
    lazy val cacheExpire = Play.application().configuration().getString("cache.expire.get.offers").toInt
    val offers:List[Offer] = Cache.getAs[List[Offer]]("offers").getOrElse{
      val offers:List[Offer] = Await.result(offerDAO.list(), 5.seconds)
      Cache.set("offers", offers, cacheExpire.seconds)
      offers
    }
    Future.successful(Ok(Json.toJson(offers)))
  }
  /**
   * Returns the partner.
   *
   * @return The result to display.
   */
  def partner = SecuredAction.async { implicit request =>
    Future.successful(Ok(Json.toJson(request.identity)))
  }

    /*
    try {
      (request.body \ "idPartner").asOpt[Long].map { idPartner =>
        val future = partnerDAO.book(Registration(None, UUID.randomUUID(), idPartner, idClazz))
        future.onSuccess { case a => Logger.debug(s"Registration created: $a"); Future.successful(Ok)}
        future.onFailure {
          case t: PSQLException => {
            if (t.getMessage.contains("duplicate key value violates unique constraint")) {
              Logger.info("Registration already exists")
              Future.successful(BadRequest("registration already exists"))
            }
            else {
              Logger.error("Something bad happened", t)
              Future.successful(InternalServerError("Something bad happened"))
            }
          }
          case t: Throwable => {
            Logger.error(t.getMessage,t)
            Future.successful(InternalServerError("Something bad happened"))
          }
          case _ => Future.successful(BadRequest("Missing parameter [idPartner]"))
        }
      }.getOrElse {
        Future.successful(BadRequest("Missing parameter [idPartner]"))
      }
    } catch {
      case t: Throwable =>
        Logger.error(t.getMessage,t)
        Future.successful(InternalServerError("Something bad happened"))
    }
    */



  def clazzes(page: Int, orderBy: Int, filter: String) = UserAwareAction.async { implicit request =>
    clazzDAO.list(page, 10, orderBy, "%" + filter + "%").flatMap { pageClazzes =>
      Future.successful(Ok(Json.toJson(pageClazzes)))
    }.recover {
      case ex: TimeoutException =>
        Logger.error("Problem found in clazz list process")
        InternalServerError(ex.getMessage)
    }
  }

  def clazzesCount = UserAwareAction.async { implicit request =>
    clazzDAO.count.flatMap{ count =>
      Future.successful(Ok(Json.toJson(count)))
    }
  }


  def clazzesPersonalized(page: Int, orderBy: Int, filter: String) = SecuredAction.async { implicit request =>
    clazzDAO.listPersonalized(page, 10, orderBy, "%" + filter + "%", request.identity.id.getOrElse(UUID.randomUUID())).flatMap { pageClazzes =>
      Future.successful(Ok(Json.toJson(pageClazzes)))
    }.recover {
      case ex: TimeoutException =>
        Logger.error("Problem found in clazz list process")
        InternalServerError(ex.getMessage)
    }
  }

  /**
   * Manages the sign out action.
   */
  def signOut = SecuredAction.async { implicit request =>
    env.eventBus.publish(LogoutEvent(request.identity, request, request2Messages))
    env.authenticatorService.discard(request.authenticator, Ok)
  }

  /**
   * Provides the desired template.
   *
   * @param template The template to provide.
   * @return The template.
   */

  def viewRestricted(template: String) = SecuredAction.async { implicit request =>
    template match {
      case "clazzes" => Future.successful(Ok(views.html.me.clazzes()))
      case "dashboard" => Future.successful(Ok(views.html.me.dashboard()))
      case "header" => Future.successful(Ok(views.html.me.header()))
      case "sidebar" => Future.successful(Ok(views.html.me.sidebar()))
      case _ => Future.successful(NotFound)
    }
  }

  def view(template: String) = UserAwareAction { implicit request =>
    template match {
      case "signIn" => Ok(views.html.signIn(socialProviderRegistry))
      case "header" => Ok(views.html.header())
      case "footer" => Ok(views.html.footer())
      case _ => NotFound
    }
  }
}
