/**
 * Copy institucional bilingüe de Economy and Fair Competition.
 * Derivado de URUCHURTU.md y ECONOMY-AND-FAIR-COMPETITION.md, aplicando las
 * reglas de despersonalización obligatorias (AGENTS.md §4, §7): cero nombres
 * propios; los perfiles individuales de socios se funden en servicios y
 * experiencia institucional agregada.
 */

export type SiteTextSeed = { key: string; es: string; en: string };

export const siteTextSeeds: SiteTextSeed[] = [
  // ---------------------------------------------------------------------
  // Hero / Home
  // ---------------------------------------------------------------------
  {
    // Imagen editable del hero — misma URL en ambos idiomas (decisión de
    // producto: la imagen no varía por idioma, a diferencia del texto). Se
    // reutiliza el modelo site_texts { es, en } guardando idéntico valor en
    // ambos campos, en vez de crear una colección paralela solo para esto.
    key: "home.hero.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "home.hero.eyebrow",
    es: "COMERCIO EXTERIOR · ADUANAS · PROPIEDAD INTELECTUAL",
    en: "FOREIGN TRADE · CUSTOMS · INTELLECTUAL PROPERTY",
  },
  {
    key: "home.hero.title",
    es: "Certeza jurídica para operar sin fronteras",
    en: "Legal certainty to operate without borders",
  },
  {
    key: "home.hero.subtitle",
    es: "Firma internacional especializada en Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial. Más de 28 años de experiencia e infraestructura global acompañando a empresas en la estructuración, cumplimiento y defensa estratégica de sus operaciones.",
    en: "International firm specialized in Foreign Trade, Customs Law, and Intellectual and Industrial Property. More than 28 years of experience and global infrastructure supporting companies in structuring, compliance, and strategic defense of their operations.",
  },
  {
    key: "home.hero.ctaPrimary",
    es: "Agende una consulta",
    en: "Schedule a consultation",
  },
  {
    key: "home.hero.ctaSecondary",
    es: "Conocer nuestros servicios",
    en: "Explore our services",
  },
  {
    key: "home.hero.stat1.value",
    es: "+28 años",
    en: "28+ years",
  },
  {
    key: "home.hero.stat1.label",
    es: "de experiencia en derecho comercial",
    en: "of experience in commercial law",
  },
  {
    key: "home.hero.stat2.value",
    es: "Presencia internacional",
    en: "International presence",
  },
  {
    key: "home.hero.stat2.label",
    es: "Participación en OMC y paneles TLCAN & T-MEC",
    en: "Participation in WTO and NAFTA & USMCA panels",
  },
  {
    key: "home.hero.stat3.value",
    es: "Confianza institucional",
    en: "Institutional trust",
  },
  {
    key: "home.hero.stat3.label",
    es: "Servicios legales de alto nivel",
    en: "High-level legal services",
  },

  // ---------------------------------------------------------------------
  // Quiénes somos (resumen Home + página completa)
  // ---------------------------------------------------------------------
  {
    key: "about.eyebrow",
    es: "ART. 102 — QUIÉNES SOMOS",
    en: "ART. 102 — ABOUT US",
  },
  {
    key: "about.title",
    es: "Experiencia e infraestructura global",
    en: "Global experience and infrastructure",
  },
  {
    key: "about.summary",
    es: "En Economy and Fair Competition asesoramos a empresas nacionales e internacionales en defensa comercial, cumplimiento aduanero y regulación transfronteriza mediante una combinación de conocimiento técnico, experiencia institucional y coordinación internacional. Con más de 28 años de práctica especializada, acompañamos a nuestros clientes en la estructuración, cumplimiento y defensa estratégica de sus operaciones de comercio exterior dentro de un entorno regulatorio dinámico y altamente técnico.",
    en: "At Economy and Fair Competition we advise national and international companies on trade defense, customs compliance, and cross-border regulation through a combination of technical knowledge, institutional experience, and international coordination. With more than 28 years of specialized practice, we support our clients in structuring, complying with, and strategically defending their foreign trade operations within a dynamic and highly technical regulatory environment.",
  },
  {
    key: "about.history.title",
    es: "Nuestra Historia",
    en: "Our History",
  },
  {
    key: "about.history.body",
    es: "Economy and Fair Competition consolida más de 28 años de trayectoria institucional como respuesta a los cambios estructurales que México experimentó desde la apertura comercial de finales del siglo XX. El incremento de las relaciones comerciales internacionales y, consecuentemente, el aumento de las disputas comerciales internacionales, crearon la necesidad de contar con una firma especializada en estas materias.\n\nDesde sus orígenes, la firma se ha distinguido por reunir un grupo selecto de profesionales con un profundo conocimiento de la interpretación judicial y la práctica administrativa de las autoridades mexicanas. Con más de dos décadas de práctica independiente, hemos desarrollado la experiencia necesaria para ofrecer un servicio de clase mundial.\n\nSomos una de las pocas firmas en México con participación exitosa en los Mecanismos de Solución de Controversias de la OMC y en los Paneles del TLCAN y T-MEC, especialmente en materia de prácticas desleales de comercio exterior. Esta experiencia internacional nos ha posicionado como líderes en el sector.",
    en: "Economy and Fair Competition consolidates more than 28 years of institutional trajectory in response to the structural changes Mexico experienced since the trade opening of the late twentieth century. The growth of international commercial relations, and consequently the increase in international trade disputes, created the need for a firm specialized in these matters.\n\nSince its origins, the firm has distinguished itself by bringing together a select group of professionals with deep knowledge of judicial interpretation and the administrative practice of Mexican authorities. With more than two decades of independent practice, we have developed the expertise necessary to offer world-class service.\n\nWe are one of the few firms in Mexico with successful participation in the WTO Dispute Settlement Mechanisms and in NAFTA and USMCA Panels, especially regarding unfair foreign trade practices. This international experience has positioned us as leaders in the sector.",
  },
  {
    key: "about.team.title",
    es: "Un Equipo Comprometido",
    en: "A Committed Team",
  },
  {
    key: "about.team.body",
    es: "Nuestro equipo está formado por profesionales apasionados por el comercio internacional, con más de dos décadas de experiencia trabajando en conjunto para ofrecer soluciones innovadoras y efectivas a nuestros clientes. La fortaleza de Economy and Fair Competition reside en su infraestructura institucional, no en trayectorias individuales.",
    en: "Our team is made up of professionals passionate about international trade, with more than two decades of experience working together to offer innovative and effective solutions to our clients. The strength of Economy and Fair Competition lies in its institutional infrastructure, not in individual careers.",
  },
  {
    key: "about.international.title",
    es: "Experiencia Internacional Destacada",
    en: "Distinguished International Experience",
  },
  {
    key: "about.international.disputes.title",
    es: "Participación en Mecanismos de Solución de Controversias",
    en: "Participation in Dispute Settlement Mechanisms",
  },
  {
    key: "about.international.disputes.body",
    es: "Participación exitosa en los Mecanismos de Solución de Controversias de la Organización Mundial del Comercio (OMC), en Paneles del Tratado de Libre Comercio de América del Norte (TLCAN) y en Paneles del T-MEC, con especialización en prácticas desleales de comercio exterior. Esta experiencia internacional proporciona una perspectiva única y un conocimiento profundo de los mecanismos de resolución de disputas comerciales a nivel global, beneficiando directamente a nuestros clientes en casos complejos de comercio internacional.",
    en: "Successful participation in the World Trade Organization (WTO) Dispute Settlement Mechanisms, in North American Free Trade Agreement (NAFTA) Panels, and in USMCA Panels, with specialization in unfair foreign trade practices. This international experience provides a unique perspective and deep knowledge of global trade dispute resolution mechanisms, directly benefiting our clients in complex international trade cases.",
  },
  {
    key: "about.international.negotiations.title",
    es: "Participación en Negociaciones Comerciales",
    en: "Participation in Trade Negotiations",
  },
  {
    key: "about.international.negotiations.body",
    es: "Colaboración en la negociación de importantes tratados comerciales, incluyendo el TLCAN, el Tratado de Libre Comercio México-Chile y el Triángulo del Norte, aportando experiencia técnica y conocimiento especializado al servicio de los intereses de México y sus clientes.",
    en: "Collaboration in the negotiation of major trade agreements, including NAFTA, the Mexico-Chile Free Trade Agreement, and the Northern Triangle, contributing technical expertise and specialized knowledge in service of Mexico's interests and those of our clients.",
  },
  {
    key: "about.specialization.title",
    es: "Nuestra Especialización",
    en: "Our Specialization",
  },
  {
    key: "about.specialization.body",
    es: "A diferencia de otras firmas generalistas, Economy and Fair Competition se enfoca exclusivamente en Comercio Exterior, Derecho Aduanero, Disputas Comerciales Internacionales, Regulaciones No Arancelarias, Prácticas Desleales de Comercio Exterior y Tratados y Acuerdos Internacionales. Esta especialización nos permite ofrecer soluciones altamente técnicas y personalizadas, adaptadas a las necesidades específicas de empresas que operan en el ámbito del comercio internacional.",
    en: "Unlike other generalist firms, Economy and Fair Competition focuses exclusively on Foreign Trade, Customs Law, International Trade Disputes, Non-Tariff Regulations, Unfair Foreign Trade Practices, and International Treaties and Agreements. This specialization allows us to offer highly technical and personalized solutions, tailored to the specific needs of companies operating in international trade.",
  },

  // ---------------------------------------------------------------------
  // Misión / Visión
  // ---------------------------------------------------------------------
  {
    key: "mission.eyebrow",
    es: "ART. 201 — MISIÓN",
    en: "ART. 201 — MISSION",
  },
  {
    key: "mission.title",
    es: "Misión",
    en: "Mission",
  },
  {
    key: "mission.body",
    es: "Proporcionar servicios y soluciones legales de vanguardia que brinden certeza, seguridad jurídica y competitividad a nuestros clientes en sus operaciones globales.",
    en: "To provide cutting-edge legal services and solutions that give our clients certainty, legal security, and competitiveness in their global operations.",
  },
  {
    key: "vision.eyebrow",
    es: "ART. 202 — VISIÓN",
    en: "ART. 202 — VISION",
  },
  {
    key: "vision.title",
    es: "Visión",
    en: "Vision",
  },
  {
    key: "vision.body",
    es: "Consolidarnos como la firma líder y más desarrollada en México y la región en comercio exterior, derecho aduanero y propiedad intelectual, operando bajo los más estrictos estándares éticos.",
    en: "To establish ourselves as the leading and most developed firm in Mexico and the region in foreign trade, customs law, and intellectual property, operating under the strictest ethical standards.",
  },

  // ---------------------------------------------------------------------
  // Valores (8 tarjetas)
  // ---------------------------------------------------------------------
  { key: "values.eyebrow", es: "ART. 203 — VALORES", en: "ART. 203 — VALUES" },
  { key: "values.title", es: "Nuestros Valores", en: "Our Values" },
  { key: "values.integrity.title", es: "Integridad", en: "Integrity" },
  {
    key: "values.integrity.body",
    es: "Actuamos con honestidad y transparencia en todas nuestras relaciones profesionales.",
    en: "We act with honesty and transparency in all our professional relationships.",
  },
  { key: "values.responsibility.title", es: "Responsabilidad", en: "Responsibility" },
  {
    key: "values.responsibility.body",
    es: "Asumimos el compromiso de cumplir con las expectativas de nuestros clientes.",
    en: "We commit to meeting our clients' expectations.",
  },
  { key: "values.experience.title", es: "Experiencia", en: "Experience" },
  {
    key: "values.experience.body",
    es: "Más de 28 años brindando soluciones especializadas en comercio exterior.",
    en: "More than 28 years providing specialized foreign trade solutions.",
  },
  { key: "values.excellence.title", es: "Excelencia", en: "Excellence" },
  {
    key: "values.excellence.body",
    es: "Buscamos la máxima calidad en cada servicio que proporcionamos.",
    en: "We pursue the highest quality in every service we provide.",
  },
  { key: "values.commitment.title", es: "Compromiso", en: "Commitment" },
  {
    key: "values.commitment.body",
    es: "Dedicación total con los objetivos y necesidades de nuestros clientes.",
    en: "Total dedication to our clients' objectives and needs.",
  },
  { key: "values.quality.title", es: "Calidad", en: "Quality" },
  {
    key: "values.quality.body",
    es: "Estándares profesionales de primer nivel en todos nuestros servicios.",
    en: "First-rate professional standards across all our services.",
  },
  { key: "values.professionalism.title", es: "Profesionalismo", en: "Professionalism" },
  {
    key: "values.professionalism.body",
    es: "Conducta ética y conocimiento técnico en cada intervención.",
    en: "Ethical conduct and technical knowledge in every engagement.",
  },
  { key: "values.proactive.title", es: "Respuesta Proactiva", en: "Proactive Response" },
  {
    key: "values.proactive.body",
    es: "Anticipamos necesidades y ofrecemos soluciones oportunas.",
    en: "We anticipate needs and deliver timely solutions.",
  },

  // ---------------------------------------------------------------------
  // Servicios (10) — home + /servicios
  // ---------------------------------------------------------------------
  { key: "services.eyebrow", es: "CAP. 10 — SERVICIOS", en: "CH. 10 — SERVICES" },
  { key: "services.title", es: "Nuestros Servicios", en: "Our Services" },
  {
    key: "services.subtitle",
    es: "Soluciones integrales en comercio exterior, derecho aduanero y propiedad intelectual.",
    en: "Comprehensive solutions in foreign trade, customs law, and intellectual property.",
  },
  {
    key: "services.1.title",
    es: "Consultoría Estratégica en Comercio Internacional y Normativa Aduanera",
    en: "Strategic Consulting in International Trade and Customs Regulations",
  },
  {
    key: "services.1.body",
    es: "Asesoría especializada en normativa aduanera y operaciones de comercio exterior, con visión estratégica de negocio.",
    en: "Specialized advice on customs regulations and foreign trade operations, with a strategic business outlook.",
  },
  {
    key: "services.1.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.1.detail",
    es: "Diseñamos la estrategia legal y operativa de comercio exterior de cada cliente considerando su cadena de suministro completa: desde la estructuración corporativa hasta el cumplimiento aduanero cotidiano, integrando visión de negocio con certeza jurídica.",
    en: "We design each client's foreign trade legal and operational strategy considering their entire supply chain: from corporate structuring to day-to-day customs compliance, integrating business vision with legal certainty.",
  },
  {
    key: "services.2.title",
    es: "Clasificación Arancelaria y Valoración Técnica en Aduana",
    en: "Tariff Classification and Technical Customs Valuation",
  },
  {
    key: "services.2.body",
    es: "Determinación correcta de fracciones arancelarias y valor en aduana de mercancías.",
    en: "Accurate determination of tariff classifications and customs value of goods.",
  },
  {
    key: "services.2.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.2.detail",
    es: "Analizamos cada mercancía con criterio técnico-arancelario para determinar su clasificación correcta y su valor en aduana, reduciendo el riesgo de observaciones y sanciones en revisiones posteriores de la autoridad.",
    en: "We analyze each good with tariff-technical criteria to determine its correct classification and customs value, reducing the risk of findings and penalties in subsequent authority reviews.",
  },
  {
    key: "services.3.title",
    es: "Optimización de Tratados Comerciales y Reglas de Origen (T-MEC / TLCs)",
    en: "Trade Agreement Optimization and Rules of Origin (USMCA / FTAs)",
  },
  {
    key: "services.3.body",
    es: "Aprovechamiento de beneficios arancelarios y cumplimiento de tratados internacionales.",
    en: "Leveraging tariff benefits and ensuring compliance with international trade agreements.",
  },
  {
    key: "services.3.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.3.detail",
    es: "Evaluamos la calificación de origen de cada producto bajo el T-MEC y los tratados de libre comercio vigentes, maximizando el aprovechamiento de preferencias arancelarias sin comprometer el cumplimiento normativo.",
    en: "We assess each product's origin qualification under USMCA and current free trade agreements, maximizing the use of tariff preferences without compromising regulatory compliance.",
  },
  {
    key: "services.4.title",
    es: "Gobierno Corporativo de Cumplimiento (Import/Export Compliance)",
    en: "Corporate Compliance Governance (Import/Export Compliance)",
  },
  {
    key: "services.4.body",
    es: "Aseguramiento del cumplimiento normativo en operaciones de comercio exterior.",
    en: "Ensuring regulatory compliance in foreign trade operations.",
  },
  {
    key: "services.4.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.4.detail",
    es: "Diseñamos e implementamos programas de cumplimiento corporativo para operaciones de importación y exportación, con políticas internas, controles documentales y capacitación que anticipan el riesgo regulatorio.",
    en: "We design and implement corporate compliance programs for import and export operations, with internal policies, documentary controls, and training that anticipate regulatory risk.",
  },
  {
    key: "services.5.title",
    es: "Defensa Comercial, Antidumping y Cuotas Compensatorias",
    en: "Trade Defense, Antidumping, and Countervailing Duties",
  },
  {
    key: "services.5.body",
    es: "Defensa en investigaciones y aplicación de cuotas compensatorias.",
    en: "Defense in investigations and the application of countervailing duties.",
  },
  {
    key: "services.5.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.5.detail",
    es: "Representamos a empresas mexicanas y extranjeras en investigaciones antidumping y de cuotas compensatorias ante la Secretaría de Economía, desde la etapa preliminar hasta la resolución final y su eventual litigio.",
    en: "We represent Mexican and foreign companies in antidumping and countervailing duty investigations before the Ministry of Economy, from the preliminary stage through final resolution and any subsequent litigation.",
  },
  {
    key: "services.6.title",
    es: "Litigio Especializado y Solución de Controversias Transfronterizas",
    en: "Specialized Litigation and Cross-Border Dispute Resolution",
  },
  {
    key: "services.6.body",
    es: "Representación legal en controversias aduaneras y comerciales.",
    en: "Legal representation in customs and commercial disputes.",
  },
  {
    key: "services.6.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.6.detail",
    es: "Litigamos controversias aduaneras y comerciales ante tribunales federales y mecanismos internacionales de solución de disputas, con estrategia procesal orientada a resultados de negocio, no solo jurídicos.",
    en: "We litigate customs and commercial disputes before federal courts and international dispute resolution mechanisms, with procedural strategy oriented toward business outcomes, not only legal ones.",
  },
  {
    key: "services.7.title",
    es: "Gestión y Administración de Programas de Fomento (IMMEX, PROSEC, Drawback)",
    en: "Management of Trade Promotion Programs (IMMEX, PROSEC, Drawback)",
  },
  {
    key: "services.7.body",
    es: "Obtención y administración de programas de fomento a las exportaciones.",
    en: "Obtaining and administering export promotion programs.",
  },
  {
    key: "services.7.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.7.detail",
    es: "Tramitamos y administramos programas IMMEX, PROSEC y Drawback, manteniendo su vigencia y correcta operación para que el beneficio fiscal y arancelario se traduzca en competitividad real de la operación.",
    en: "We process and administer IMMEX, PROSEC, and Drawback programs, maintaining their validity and correct operation so that the tax and tariff benefit translates into real operational competitiveness.",
  },
  {
    key: "services.8.title",
    es: "Auditorías Aduaneras Preventivas y Diagnóstico Normativo",
    en: "Preventive Customs Audits and Regulatory Diagnostics",
  },
  {
    key: "services.8.body",
    es: "Revisión preventiva y correctiva del cumplimiento de obligaciones aduaneras.",
    en: "Preventive and corrective review of customs compliance obligations.",
  },
  {
    key: "services.8.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.8.detail",
    es: "Realizamos auditorías preventivas que identifican inconsistencias documentales, arancelarias y operativas antes de que la autoridad las detecte, con un plan de corrección claro y priorizado por riesgo.",
    en: "We conduct preventive audits that identify documentary, tariff, and operational inconsistencies before the authority detects them, with a clear correction plan prioritized by risk.",
  },
  {
    key: "services.9.title",
    es: "Certificación y Verificación Estratégica de Origen",
    en: "Strategic Origin Certification and Verification",
  },
  {
    key: "services.9.body",
    es: "Tramitación y validación de certificados de origen para exportaciones.",
    en: "Processing and validation of certificates of origin for exports.",
  },
  {
    key: "services.9.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.9.detail",
    es: "Validamos y tramitamos certificados de origen con respaldo documental sólido, anticipando los criterios que las autoridades verificadoras revisan con mayor frecuencia en procesos de comprobación.",
    en: "We validate and process certificates of origin with solid documentary backing, anticipating the criteria that verifying authorities most frequently review in verification processes.",
  },
  {
    key: "services.10.title",
    es: "Relaciones Institucionales, Asesoría Regulatoria y Propiedad Intelectual/Industrial",
    en: "Institutional Relations, Regulatory Advice, and Intellectual/Industrial Property",
  },
  {
    key: "services.10.body",
    es: "Gestión ante autoridades, consultoría en cambios normativos, y protección de activos de propiedad intelectual e industrial.",
    en: "Engagement with authorities, advice on regulatory changes, and protection of intellectual and industrial property assets.",
  },
  {
    key: "services.10.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "services.10.detail",
    es: "Acompañamos a nuestros clientes ante autoridades regulatorias y protegemos sus activos de propiedad intelectual e industrial, integrando la estrategia de cumplimiento con la de protección de marca y tecnología.",
    en: "We support our clients before regulatory authorities and protect their intellectual and industrial property assets, integrating compliance strategy with brand and technology protection.",
  },

  // ---------------------------------------------------------------------
  // 4 Áreas de especialización global
  // ---------------------------------------------------------------------
  { key: "expertise.eyebrow", es: "ART. 301 — ESPECIALIZACIÓN GLOBAL", en: "ART. 301 — GLOBAL EXPERTISE" },
  { key: "expertise.title", es: "Áreas de Especialización Global", en: "Global Areas of Expertise" },
  {
    key: "expertise.a.title",
    es: "Comercio Exterior, Aduanas y Cumplimiento Transfronterizo",
    en: "Foreign Trade, Customs, and Cross-Border Compliance",
  },
  {
    key: "expertise.a.summary",
    es: "Asesoría integral en operaciones de importación y exportación, clasificación arancelaria y cumplimiento normativo transfronterizo.",
    en: "Comprehensive advice on import and export operations, tariff classification, and cross-border regulatory compliance.",
  },
  {
    key: "expertise.a.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "expertise.a.detail",
    es: "Acompañamos a nuestros clientes en la estructuración de operaciones de comercio exterior conforme a la normativa aduanera vigente, la administración de programas de fomento (IMMEX, PROSEC, Drawback) y auditorías preventivas que anticipan contingencias antes de que se conviertan en controversias.",
    en: "We support our clients in structuring foreign trade operations in accordance with current customs regulations, administering trade promotion programs (IMMEX, PROSEC, Drawback), and conducting preventive audits that anticipate contingencies before they become disputes.",
  },
  {
    key: "expertise.b.title",
    es: "Defensa Comercial, Antidumping y Prácticas Desleales",
    en: "Trade Defense, Antidumping, and Unfair Practices",
  },
  {
    key: "expertise.b.summary",
    es: "Conducción estratégica de investigaciones por prácticas desleales, discriminación de precios y procedimientos antidumping.",
    en: "Strategic handling of investigations into unfair practices, price discrimination, and antidumping proceedings.",
  },
  {
    key: "expertise.b.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "expertise.b.detail",
    es: "Representamos a empresas mexicanas, importadores nacionales y exportadores extranjeros en investigaciones ante la Secretaría de Economía y litigio ante Tribunales Federales, con base en experiencia institucional directa en los Mecanismos de Solución de Controversias de la OMC y paneles TLCAN/T-MEC.",
    en: "We represent Mexican companies, national importers, and foreign exporters in investigations before the Ministry of Economy and litigation before Federal Courts, backed by direct institutional experience in WTO Dispute Settlement Mechanisms and NAFTA/USMCA panels.",
  },
  {
    key: "expertise.c.title",
    es: "Propiedad Intelectual e Industrial",
    en: "Intellectual and Industrial Property",
  },
  {
    key: "expertise.c.summary",
    es: "Protección estratégica de activos intangibles en operaciones de comercio internacional.",
    en: "Strategic protection of intangible assets in international trade operations.",
  },
  {
    key: "expertise.c.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "expertise.c.detail",
    es: "Asesoramos en el registro, protección y defensa de marcas, patentes y otros activos de propiedad intelectual e industrial, integrando esta protección a la estrategia comercial internacional de nuestros clientes.",
    en: "We advise on the registration, protection, and defense of trademarks, patents, and other intellectual and industrial property assets, integrating this protection into our clients' international trade strategy.",
  },
  {
    key: "expertise.d.title",
    es: "Consultoría Financiera y Regulación Bancaria",
    en: "Financial Consulting and Banking Regulation",
  },
  {
    key: "expertise.d.summary",
    es: "Asesoría financiera especializada y consultoría en regulación bancaria para operaciones complejas.",
    en: "Specialized financial advice and banking regulation consulting for complex operations.",
  },
  {
    key: "expertise.d.image",
    es: "/uploads/home/home-hero-default.png",
    en: "/uploads/home/home-hero-default.png",
  },
  {
    key: "expertise.d.detail",
    es: "Con base en experiencia institucional en supervisión de entidades financieras y análisis económico aplicado a la defensa comercial, apoyamos a nuestros clientes en la reconstrucción de estructuras de costos, modelos de determinación de márgenes de dumping y evaluación de indicadores de daño, así como en el diseño de esquemas de cumplimiento normativo financiero.",
    en: "Drawing on institutional experience in financial entity supervision and economic analysis applied to trade defense, we support our clients in reconstructing cost structures, dumping margin determination models, and injury indicator assessments, as well as designing financial regulatory compliance schemes.",
  },

  // ---------------------------------------------------------------------
  // Industrias (10, con Marítimo, sin Aeroespacial)
  // ---------------------------------------------------------------------
  { key: "industries.eyebrow", es: "ART. 401 — INDUSTRIAS", en: "ART. 401 — INDUSTRIES" },
  { key: "industries.title", es: "Industrias que Atendemos", en: "Industries We Serve" },
  {
    key: "industries.subtitle",
    es: "Experiencia especializada en múltiples sectores productivos.",
    en: "Specialized experience across multiple productive sectors.",
  },
  { key: "industries.automotive.name", es: "Automotriz", en: "Automotive" },
  { key: "industries.automotive.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.automotive.detail",
    es: "Cumplimiento de reglas de origen T-MEC y clasificación arancelaria en cadenas de suministro complejas.",
    en: "USMCA rules-of-origin compliance and tariff classification across complex supply chains.",
  },
  { key: "industries.energy.name", es: "Energía", en: "Energy" },
  { key: "industries.energy.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.energy.detail",
    es: "Asesoría regulatoria en importación de equipo especializado y cumplimiento transfronterizo del sector energético.",
    en: "Regulatory advice on specialized equipment imports and cross-border compliance in the energy sector.",
  },
  { key: "industries.mining.name", es: "Minería", en: "Mining" },
  { key: "industries.mining.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.mining.detail",
    es: "Clasificación arancelaria de maquinaria pesada y cumplimiento aduanero en operaciones de exportación de minerales.",
    en: "Tariff classification of heavy machinery and customs compliance in mineral export operations.",
  },
  { key: "industries.textile.name", es: "Textil", en: "Textile" },
  { key: "industries.textile.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.textile.detail",
    es: "Defensa en investigaciones antidumping y verificación de origen en cadenas textiles regionales.",
    en: "Defense in antidumping investigations and origin verification across regional textile supply chains.",
  },
  { key: "industries.electronics.name", es: "Electrónica", en: "Electronics" },
  { key: "industries.electronics.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.electronics.detail",
    es: "Clasificación técnica especializada y cumplimiento normativo en importación de componentes electrónicos.",
    en: "Specialized technical classification and regulatory compliance in electronic component imports.",
  },
  { key: "industries.pharma.name", es: "Farmacéutica", en: "Pharmaceutical" },
  { key: "industries.pharma.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.pharma.detail",
    es: "Cumplimiento regulatorio transfronterizo y gestión de permisos sanitarios en operaciones de comercio exterior.",
    en: "Cross-border regulatory compliance and health permit management in foreign trade operations.",
  },
  { key: "industries.manufacturing.name", es: "Manufactura", en: "Manufacturing" },
  { key: "industries.manufacturing.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.manufacturing.detail",
    es: "Administración de programas IMMEX y auditorías preventivas de cumplimiento aduanero.",
    en: "IMMEX program administration and preventive customs compliance audits.",
  },
  { key: "industries.food.name", es: "Alimentos", en: "Food" },
  { key: "industries.food.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.food.detail",
    es: "Certificación de origen y cumplimiento de regulaciones no arancelarias en exportación de productos agroalimentarios.",
    en: "Origin certification and non-tariff regulatory compliance for agri-food product exports.",
  },
  { key: "industries.logistics.name", es: "Logística y Transporte", en: "Logistics and Transportation" },
  { key: "industries.logistics.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.logistics.detail",
    es: "Asesoría integral en operaciones aduaneras y optimización de cadenas logísticas transfronterizas.",
    en: "Comprehensive advice on customs operations and optimization of cross-border logistics chains.",
  },
  { key: "industries.maritime.name", es: "Marítimo", en: "Maritime" },
  { key: "industries.maritime.image", es: "/uploads/home/home-hero-default.png", en: "/uploads/home/home-hero-default.png" },
  {
    key: "industries.maritime.detail",
    es: "Cumplimiento aduanero portuario y asesoría en controversias comerciales del sector naviero.",
    en: "Port customs compliance and advice on trade disputes in the shipping sector.",
  },

  // ---------------------------------------------------------------------
  // Garantía
  // ---------------------------------------------------------------------
  { key: "guarantee.eyebrow", es: "ART. 501 — NUESTRA GARANTÍA", en: "ART. 501 — OUR GUARANTEE" },
  { key: "guarantee.title", es: "Nuestra Garantía", en: "Our Guarantee" },
  {
    key: "guarantee.body",
    es: "Nos comprometemos a proporcionar servicios legales profesionales basados en la experiencia, integridad y altos estándares, permitiendo a nuestros clientes operar con certeza y seguridad jurídica en todas sus operaciones de comercio internacional.",
    en: "We are committed to providing professional legal services based on experience, integrity, and high standards, enabling our clients to operate with certainty and legal security in all their international trade operations.",
  },
  { key: "guarantee.item1.title", es: "Seguridad Jurídica", en: "Legal Security" },
  {
    key: "guarantee.item1.body",
    es: "Garantizamos certeza legal en todas sus operaciones.",
    en: "We guarantee legal certainty in all your operations.",
  },
  { key: "guarantee.item2.title", es: "Excelencia Profesional", en: "Professional Excellence" },
  {
    key: "guarantee.item2.body",
    es: "Más de 28 años de experiencia comprobada.",
    en: "More than 28 years of proven experience.",
  },
  { key: "guarantee.item3.title", es: "Compromiso Total", en: "Total Commitment" },
  {
    key: "guarantee.item3.body",
    es: "Acompañamiento personalizado en cada caso.",
    en: "Personalized support in every case.",
  },

  // ---------------------------------------------------------------------
  // CTA final Home
  // ---------------------------------------------------------------------
  {
    key: "home.cta.title",
    es: "¿Necesita asesoría especializada?",
    en: "Do you need specialized advice?",
  },
  {
    key: "home.cta.body",
    es: "Contáctenos para discutir su caso en comercio exterior, derecho aduanero o propiedad intelectual.",
    en: "Contact us to discuss your case in foreign trade, customs law, or intellectual property.",
  },
  {
    key: "home.cta.button",
    es: "Ir a contacto",
    en: "Go to contact",
  },

  // ---------------------------------------------------------------------
  // Contacto
  // ---------------------------------------------------------------------
  { key: "contact.eyebrow", es: "ART. 701 — CONTACTO", en: "ART. 701 — CONTACT" },
  { key: "contact.title", es: "Forma de Contacto", en: "Contact" },
  {
    key: "contact.subtitle",
    es: "Contáctenos para discutir su caso en comercio exterior, derecho aduanero o propiedad intelectual.",
    en: "Contact us to discuss your case in foreign trade, customs law, or intellectual property.",
  },
  { key: "contact.form.name", es: "Nombre", en: "Name" },
  { key: "contact.form.company", es: "Empresa", en: "Company" },
  { key: "contact.form.email", es: "Correo electrónico", en: "Email" },
  { key: "contact.form.phone", es: "Teléfono", en: "Phone" },
  { key: "contact.form.areaOfInterest", es: "Área de interés", en: "Area of interest" },
  { key: "contact.form.message", es: "Mensaje", en: "Message" },
  { key: "contact.form.submit", es: "Enviar mensaje", en: "Send message" },
  { key: "contact.form.submitting", es: "Enviando…", en: "Sending…" },
  {
    key: "contact.form.success",
    es: "Gracias por contactarnos. Un miembro de nuestro equipo se comunicará con usted a la brevedad.",
    en: "Thank you for contacting us. A member of our team will reach out to you shortly.",
  },
  {
    key: "contact.form.error",
    es: "No pudimos enviar su mensaje. Intente de nuevo o contáctenos directamente por correo.",
    en: "We could not send your message. Please try again or contact us directly by email.",
  },
  { key: "contact.direct.title", es: "Datos Directos de Atención", en: "Direct Contact Details" },
  { key: "contact.direct.addressLabel", es: "Dirección", en: "Address" },
  {
    key: "contact.direct.address",
    es: "Bosque de Cipreses Sur 51, Bosques de las Lomas, Miguel Hidalgo, CDMX, 11700",
    en: "Bosque de Cipreses Sur 51, Bosques de las Lomas, Miguel Hidalgo, CDMX, 11700",
  },
  { key: "contact.direct.emailLabel", es: "Correo Electrónico", en: "Email" },
  {
    key: "contact.direct.email",
    es: "economyandfaircompetition@gmail.com",
    en: "economyandfaircompetition@gmail.com",
  },
  { key: "contact.direct.hoursLabel", es: "Horario de atención", en: "Business hours" },
  {
    key: "contact.direct.hours",
    es: "Lunes a Viernes, 9:00 a 18:00 (hora de Ciudad de México)",
    en: "Monday to Friday, 9:00 AM to 6:00 PM (Mexico City time)",
  },
  { key: "contact.map.title", es: "Ubicación", en: "Location" },

  { key: "footer.brand", es: "Economy & Fair Competition", en: "Economy & Fair Competition" },
  {
    key: "footer.tagline",
    es: "Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial. Más de 28 años de experiencia e infraestructura global.",
    en: "Foreign Trade, Customs Law, and Intellectual and Industrial Property. Over 28 years of experience and global infrastructure.",
  },
  { key: "footer.contactLabel", es: "Contacto", en: "Contact" },
];
