package controllers

import java.util.UUID
import java.util.concurrent.TimeoutException
import javax.inject.{Inject, Singleton}

import com.mohiva.play.silhouette.api.{Environment, Silhouette}
import com.mohiva.play.silhouette.impl.authenticators.JWTAuthenticator
import com.mohiva.play.silhouette.impl.providers.SocialProviderRegistry
import models._
import models.daos._
import play.api.Logger
import play.api.i18n.{Lang, MessagesApi}
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * The basic clazz def controller.
 *
 * @param messagesApi The Play messages API.
 * @param env The Silhouette environment.
 * @param socialProviderRegistry The social provider registry.
 */
@Singleton
class ClazzDefinitionController @Inject()(
                                       val messagesApi: MessagesApi,
                                       val env: Environment[Partner, JWTAuthenticator],
                                       socialProviderRegistry: SocialProviderRegistry,
                                       clazzDefinitionDAO: ClazzDefinitionDAO)
  extends Silhouette[Partner, JWTAuthenticator] {


  def listByPartner(page: Int, orderBy: Int, filter: String) = SecuredAction.async { implicit request =>
    clazzDefinitionDAO.listByPartner(page, 10, orderBy, request.identity.id.getOrElse(UUID.randomUUID())).flatMap { pageClazzes =>
      Future.successful(Ok(Json.toJson(pageClazzes)))
    }.recover {
      case ex: TimeoutException =>
        Logger.error("Problem found in clazz list process")
        InternalServerError(ex.getMessage)
    }
  }

}
