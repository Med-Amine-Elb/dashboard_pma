export interface AttributionPrintData {
  userName: string;
  userEmail?: string;
  userPhone?: string; 
  userFunction?: string;
  entity?: string;
  hierarchicalManager?: string;
  hierarchicalManagerFunction?: string;
  phoneModel?: string;
  phoneBrand?: string;
  phoneImei?: string;
  simCardNumber?: string;
  assignedBy?: string;
  assignmentDate?: string;
  status?: string;
  notes?: string;
  assetType?: "phone" | "computer" | "both";
}

export function printAttributionForm(data: AttributionPrintData): void {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Determine deviceBrand if missing
  let deviceBrand = data.phoneBrand || "";
  if (!deviceBrand && data.phoneModel) {
    const modelLower = data.phoneModel.toLowerCase();
    if (modelLower.includes("iphone") || modelLower.includes("apple") || modelLower.startsWith("ip")) {
      deviceBrand = "APPLE";
    } else if (modelLower.includes("samsung") || modelLower.startsWith("sm-") || modelLower.startsWith("galaxy")) {
      deviceBrand = "SAMSUNG";
    }
  }

  const headerHtml = `
    <table class="header-table">
      <tr>
        <td class="logo-box">
          <img src="/gbm-logo.png" alt="GBM" style="max-height: 35pt;" onerror="this.outerHTML='<div style=\"font-size: 20pt; font-weight: bold; color: #0056b3;\">GBM</div>'"/>
        </td>
        <td class="title-box">
          <h1>Fiche d'attribution d'actif</h1>
          <p>Système d'Information</p>
        </td>
        <td class="ref-box">
          Réf. : <span style="color: red; text-decoration: underline;">GBM_SSI_Attribution</span>
        </td>
      </tr>
    </table>
  `;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 9pt; color: #333; line-height: 1.2; }
    @page { size: A4; margin: 10mm; }
    .page { width: 100%; min-height: 277mm; position: relative; page-break-after: always; padding-bottom: 20pt; }
    .page:last-child { page-break-after: avoid; }
    
    .header-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-bottom: 5pt; }
    .header-table td { border: 1.5px solid #000; padding: 5pt; vertical-align: middle; }
    .logo-box { width: 100pt; text-align: center; }
    .title-box { text-align: center; }
    .title-box h1 { font-size: 14pt; margin-bottom: 2pt; color: #555; }
    .title-box p { font-size: 10pt; color: #777; }
    .ref-box { width: 120pt; font-size: 8pt; text-align: left; padding-left: 10pt; }
    
    .blue-banner { background-color: #0056b3; color: white; text-align: center; font-weight: bold; padding: 4pt; font-size: 10pt; border: 1.5px solid #000; border-bottom: none; }
    
    .form-table { width: 100%; border-collapse: collapse; margin-bottom: 5pt; }
    .form-table td { border: 1.5px solid #000; padding: 4pt 6pt; vertical-align: top; }
    .label-cell { background-color: #f2f2f2; font-weight: bold; width: 130pt; font-size: 8.5pt; }
    .value-cell { background-color: #fff; font-size: 9pt; }
    .label-inner { font-weight: bold; font-size: 8pt; margin-bottom: 1pt; }
    
    .checkbox { width: 10pt; height: 10pt; border: 1.2px solid #000; display: inline-block; margin-right: 5pt; vertical-align: middle; position: relative; }
    .checkbox.checked::after { content: 'X'; position: absolute; top: -1pt; left: 1pt; font-size: 8pt; font-weight: bold; }
    
    .reserved-header { background-color: #d9d9d9; font-weight: bold; padding: 3pt 6pt; border: 1.5px solid #000; border-top: none; font-size: 9pt; }
    
    .verso-section-title { font-weight: bold; font-size: 10pt; text-decoration: underline; margin: 10pt 0 5pt 0; text-align: left; }
    .verso-content { font-size: 7.5pt; text-align: justify; line-height: 1.1; }
    .verso-item { margin-bottom: 3pt; }
    .verso-item strong { display: inline-block; width: 15pt; }
    
    .signature-footer { margin-top: 30pt; display: flex; justify-content: space-between; align-items: flex-end; width: 100%; }
    .sig-box { width: 250pt; text-align: right; }
    .sig-line { font-weight: bold; margin-bottom: 5pt; }
    .sig-label { font-size: 8pt; font-style: italic; color: #666; }
    .sig-space { height: 60pt; }
  </style>
</head>
<body>
  <!-- PAGE 1: RECTO -->
  <div class="page">
    ${headerHtml}

    <div class="blue-banner">(Ordinateur / Téléphone mobile)</div>
    <table class="form-table">
      <tr>
        <td class="label-cell">Nom et Prénom du<br/>Bénéficiaire de l'actif</td>
        <td class="value-cell" style="width: 150pt; font-weight: bold;">${escapeHtml(data.userName || "")}</td>
        <td style="width: 140pt;">
          <div class="label-inner">Fonction :</div>
          ${escapeHtml(data.userFunction || "Agent Administratif")}
        </td>
        <td rowspan="3" style="width: 100pt; font-weight: bold; font-size: 8.5pt; vertical-align: middle;">
          Entité : Société des Boissons du Maroc (SBM)
        </td>
      </tr>
      <tr>
        <td class="label-cell">Téléphone</td>
        <td class="value-cell" style="font-weight: bold;">${escapeHtml(data.simCardNumber || data.userPhone || "____________________")}</td>
        <td>
          <div class="label-inner">Courriel :</div>
          <span style="font-size: 8.5pt;">${escapeHtml(data.userEmail || "")}</span>
        </td>
      </tr>
      <tr>
        <td class="label-cell">Responsable hiérarchique</td>
        <td class="value-cell" style="font-weight: bold;">${escapeHtml(data.hierarchicalManager || "Yassine ELHADI")}</td>
        <td>
          <div class="label-inner">Fonction :</div>
          ${escapeHtml(data.hierarchicalManagerFunction || "Chef Département Moyens Généraux")}
        </td>
      </tr>
      <tr>
        <td class="label-cell">Actif attribué</td>
        <td colspan="3">
          <div style="display: flex; gap: 40pt; align-items: center; padding: 2pt 0;">
            <span><div class="checkbox ${data.assetType === 'computer' ? 'checked' : ''}"></div> Ordinateur avec accessoires</span>
            <span><div class="checkbox ${data.assetType === 'phone' || !data.assetType ? 'checked' : ''}"></div> Téléphone mobile</span>
          </div>
        </td>
      </tr>
      <tr>
        <td class="label-cell">Référence de l'actif</td>
        <td colspan="3" class="value-cell">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>${escapeHtml(data.phoneModel || "____________________")}</span>
            <span style="font-weight: normal;">IMEI : <span style="font-weight: bold;">${escapeHtml(data.phoneImei || "____________________")}</span></span>
          </div>
        </td>
      </tr>
      <tr>
        <td class="label-cell">Constructeur</td>
        <td colspan="3" class="value-cell" style="font-weight: bold;">${escapeHtml(deviceBrand)}</td>
      </tr>
      <tr>
        <td class="label-cell">Solution de chiffrement</td>
        <td colspan="3">
          <div style="display: flex; gap: 50pt;">
            <div>
              <div style="margin-bottom: 3pt;"><div class="checkbox"></div> Installée</div>
              <div><div class="checkbox"></div> Mise à jour</div>
            </div>
            <div style="font-size: 8.5pt;">
              <div style="margin-bottom: 2pt;"><strong>Nom de la solution :</strong> __________________</div>
              <div><strong>Version :</strong> _________________________</div>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="label-cell">Solution Antivirale</td>
        <td colspan="3">
          <div style="display: flex; gap: 50pt;">
            <div>
              <div style="margin-bottom: 3pt;"><div class="checkbox"></div> Installée</div>
              <div><div class="checkbox"></div> Mise à jour</div>
            </div>
            <div style="font-size: 8.5pt;">
              <div style="margin-bottom: 2pt;"><strong>Nom de la solution :</strong> __________________</div>
              <div><strong>Version :</strong> _________________________</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="reserved-header">Réservé à l'administrateur</div>
    <table class="form-table" style="margin-top: 0; border-top: none;">
      <tr>
        <td class="label-cell" style="width: 130pt;">Etat de sécurité de l'actif</td>
        <td colspan="3" style="font-size: 8.5pt;">
          L'administrateur SI atteste, par la présente que l'actif dont les informations d'identification sont citées ci-dessus est muni des outils de sécurité nécessaires, et qu'il est prêt à être attribué à l'utilisateur <strong style="text-decoration: underline;">${escapeHtml(data.userName || "")}</strong>
        </td>
      </tr>
      <tr>
        <td class="label-cell" style="font-size: 8pt; line-height: 1.1;">Réponse de l'administrateur SI à la demande d'attribution de l'actif</td>
        <td style="width: 120pt; vertical-align: middle;">
          <div style="margin-bottom: 8pt;"><div class="checkbox"></div> Demande acceptée</div>
          <div><div class="checkbox"></div> Demande Refusée</div>
        </td>
        <td style="width: 140pt;">
          <div class="label-inner">Justification :</div>
          <div style="height: 35pt;"></div>
        </td>
        <td>
          <div class="label-inner">Signature et date :</div>
        </td>
      </tr>
    </table>

    <div class="reserved-header">Réservé au RSSI</div>
    <table class="form-table" style="margin-top: 0; border-top: none;">
      <tr>
        <td class="label-cell" style="width: 130pt; font-size: 8pt; line-height: 1.1;">Approbation du Responsable de Sécurité de l'Information pour l'attribution de l'actif</td>
        <td style="width: 120pt; vertical-align: middle;">
          <div style="margin-bottom: 8pt;"><div class="checkbox"></div> Demande acceptée</div>
          <div><div class="checkbox"></div> Demande Refusée</div>
        </td>
        <td style="width: 140pt;">
          <div class="label-inner">Justification :</div>
          <div style="height: 35pt;"></div>
        </td>
        <td>
          <div class="label-inner">Signature et date :</div>
        </td>
      </tr>
    </table>

    <div class="verso-section-title" style="margin-top: 15pt; border-top: 1.5px solid #000; padding-top: 5pt;">Conditions Générales d'Utilisation de l'Équipement Informatique alloué au Collaborateur</div>
    <div class="verso-content">
      <div class="verso-item"><strong>1.</strong> Entre : Le collaborateur SBM bénéficiaire de l'actif (ci-dessous « collaborateur ») et la Société à savoir l'une des sociétés suivantes en fonction du salarié : Société des Boissons du Maroc (SBM), La Clé des Champs (CDC), Cépages Marocains Réunis (CMAR), Euro-Africaine des Eaux (EAE), African Retail Market (ARM), Société de Vinification et de Commercialisation du Maroc (SVCM) (ci-dessous « Société ») ensemble ci-après dénommés « les parties » (Société & Collaborateur).</div>
      <div class="verso-item"><strong>2.</strong> En utilisant cet équipement, le Collaborateur reconnaît avoir pris connaissance de ces Conditions Générales d'Utilisation et en accepter les termes.</div>
      <div class="verso-item"><strong>3.</strong> Société s'efforce de mettre en place une configuration sécurisée de tous ses équipements conformément à sa politique de sécurité des postes de travail et terminaux mobiles. Malgré ce soin et cette attention, il est possible que cette configuration soit incomplète. De ce fait, it is de la responsabilité du Collaborateur, de s'assurer que l'équipement qui lui a été remis respecte les configurations sécurisées en vigueur.</div>
      <div class="verso-item"><strong>4.</strong> Société n'est pas responsable de tout dommage causé ou qui risque d'être causé et qui découle de, ou a tous égards un lien with l'utilisation de l'équipement par le Collaborateur.</div>
    </div>
  </div>

  <!-- PAGE 2: VERSO -->
  <div class="page">
    ${headerHtml}
    <div class="verso-content" style="margin-top: 10pt;">
      <div class="verso-item"><strong>5.</strong> Société peut modifier le fonctionnement d'un équipement ou suspendre une fonctionnalité ou application, à sa discrétion et à tout moment, avec ou sans notification préalable.</div>
      <div class="verso-item"><strong>6.</strong> Pour les besoins de sécurité et de protection du patrimoine informationnel Société se réserve le droit de vous refuser l'autorisation d'utiliser certaines fonctionnalités de l'équipement et / ou d'utiliser certains services fournis par les applications installées dans l'équipement. Par ailleurs, l'équipement reste la propriété de la Société qui peut à tout moment effectuer une surveillance de son utilisation par les moyens technologiques déployés sur le système d'information, ce que le Collaborateur affirme en avoir pris connaissance et en accepter les termes.</div>
      <div class="verso-item"><strong>7.</strong> Le Collaborateur reconnaît qu'à partir du moment de la prise de possession physique de l'équipement informatique alloué, les risques de perte ou d'endommagement dudit équipement lui sont transférés.</div>
      <div class="verso-item"><strong>8.</strong> Le Collaborateur reconnaît d'ores et déjà que la Société pourra exercer toutes les mesures et / ou poursuites judiciaires nécessaires en cas d'une quelconque violation des présentes Conditions Générales d'Utilisation de l'Équipement Informatique alloué.</div>
      <div class="verso-item"><strong>9.</strong> Les présentes conditions d'utilisation seront régies par, et interprétées conformément aux lois en vigueur au Maroc.</div>
    </div>

    <div class="verso-section-title">Conditions relatives à la mise à disposition d'un ordinateur</div>
    <div class="verso-content">
      <div class="verso-item"><strong>1.</strong> Dans le cadre de ses fonctions, la Société met à la disposition du Collaborateur un ordinateur réservé à un usage professionnel.</div>
      <div class="verso-item"><strong>2.</strong> Cet ordinateur devra être restitué à la Société :
        <div style="margin-left: 20pt;">a. Sur simple demande de cette dernière qui pourra mettre en place tout autre moyen de travail qu'elle jugera nécessaire ;</div>
        <div style="margin-left: 20pt;">b. Au plus tard lors de la signature du Solde de Tout Compte, en cas de cessation des fonctions du Collaborateur au sein de SBM.</div>
      </div>
    </div>

    <div class="verso-section-title">Conditions relatives à la mise à disposition d'un téléphone mobile</div>
    <div class="verso-content">
      <div class="verso-item"><strong>1.</strong> Pour les besoins de son activité, la Société met à la disposition du Collaborateur un téléphone portable dont les frais générés par l'abonnement et les consommations téléphoniques seront pris en charge par la Société.</div>
      <div class="verso-item"><strong>2.</strong> Il est expressément convenu entre les parties que l'utilisation de ce téléphone est réservée à un strict usage professionnel.</div>
      <div class="verso-item"><strong>3.</strong> L'usage du présent actif est dédié à l'usage professionnel. L'utilisateur s'engage à limiter au maximum les communications à caractère personnel.</div>
      <div class="verso-item"><strong>4.</strong> Il est toutefois convenu entre les parties que la mise à disposition de ce téléphone portable ne constitue, en aucun cas, un élément essentiel du contrat de travail ni un acquis social ou quelconque avantage en nature.</div>
      <div class="verso-item"><strong>5.</strong> Ce téléphone mobile devra être restitué à la Société en bon état :
        <div style="margin-left: 20pt;">a. Sur simple demande de cette dernière qui pourra mettre en place tout autre moyen de communication qu'elle jugera nécessaire ;</div>
        <div style="margin-left: 20pt;">b. Au plus tard lors de la signature du Solde de Tout Compte, en cas de cessation des fonctions du Collaborateur au sein de SBM.</div>
      </div>
    </div>

    <div class="verso-section-title">Conditions d'utilisation</div>
    <div class="verso-content">
      <div class="verso-item"><strong>1.</strong> Le Collaborateur reconnaît qu'un exemplaire de cette décharge lui a été remis et qu'il en a pris, ou prendra connaissance dans les meilleurs délais, ainsi que des différentes politiques et procédures de sécurité associés dont notamment « la Charte d'utilisation DSI ».</div>
      <div class="verso-item"><strong>2.</strong> L'utilisation non autorisée ou inappropriée de l'équipement ou de ses données peut constituer une violation du droit de la propriété intellectuelle, de la réglementation en matière de vie privée plus spécifiquement de la loi 09-08 pour la protection des personnes physiques à l'égard de l'usage des données à caractère personnel, et de publication et / ou de communication au sens le plus large du terme. La Société dégage toute responsabilité en cas d'une quelconque violation par le Collaborateur telle que mentionnée ci-dessus.</div>
      <div class="verso-item"><strong>3.</strong> Le Collaborateur est responsable de tout ce qu'il stocke, et/ou envoie via équipement informatique alloué.</div>
      <div class="verso-item"><strong>4.</strong> Société fait tout son possible pour garder l'équipement sans codes ou logiciels malveillants. Il est de la responsabilité du Collaborateur de prendre des mesures de précaution et de s'assurer que tout ce qu'il choisit d'utiliser est exempt de virus, de « vers », de « chevaux de Troie » et d'autres éléments de nature destructrice.</div>
    </div>

    <div class="verso-section-title">Modification aux conditions d'utilisation</div>
    <div class="verso-content">
      <div class="verso-item"><strong>1.</strong> La Société peut modifier ces conditions d'utilisation à tout moment en envoyant une simple notification de quelque manière que ce soit au Collaborateur. Le Collaborateur sera présumé en avoir pris connaissance et les avoir acceptés en l'état par cette simple notification.</div>
    </div>

    <div class="signature-footer">
      <div style="font-size: 9pt;">Reçu à ____________________ le ${formattedDate}</div>
      <div class="sig-box">
        <div class="sig-line">Signature du collaborateur</div>
        <div class="sig-label">(Précédée de la mention écrite « lu et approuvé »)</div>
        <div class="sig-space"></div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Veuillez autoriser les popups pour imprimer la fiche.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
