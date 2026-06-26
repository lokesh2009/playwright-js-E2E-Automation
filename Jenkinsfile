#!/usr/bin/env groovy
pipeline {
    agent {
        node {
            label 'linux'
        }
    }

    // ── Parameters ─────────────────────────────────────────────────────────────
    // All overridable at build time so QA/UAT and suite/module combinations
    // can be driven from a Jenkins "Build with Parameters" form.
    parameters {
        choice(
            name: 'SUITE',
            choices: ['smoke', 'regression'],
            description: 'Test suite to run: smoke (fast, critical path) or regression (full)'
        )
        choice(
            name: 'MODULE',
            choices: [
                'all',
                'inventory',
                'lighthouse',
                'healthcheck',
                'filters',
                'inventory-management',
                'v6',
                'v7',
                'powersports',
                'marine',
                'rv',
                'parts',
                'login',
                'api',
                'performance'
            ],
            description: 'Module to target. Selects the matching Cucumber tag. Use "all" to run every tag in the chosen suite.'
        )
    }

    // ── Environment ────────────────────────────────────────────────────────────
    environment {
        qaTargetEnv      = 'QA'
        uatTargetEnv     = 'UAT'

        NODE_VERSION     = 'nodejs18x'
        REPORT_DIR       = 'allure-results'
        HTML_REPORT_DIR  = 'reports'
        TEST_RESULTS_DIR = 'tests/test-results'

        assemblyVersion  = "1.0.${env.BUILD_NUMBER}"
    }

    options {
        skipDefaultCheckout(true)
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Abort if the whole pipeline exceeds 2 hours
        timeout(time: 2, unit: 'HOURS')
    }

    // ── Stages ─────────────────────────────────────────────────────────────────
    stages {

        // ── 1. Checkout ────────────────────────────────────────────────────────
        stage('Clean Workspace and Checkout Code') {
            steps {
                cleanWs()
                script {
                    def checkoutVars = checkout scm
                    env.GIT_URL    = checkoutVars.GIT_URL
                    env.GIT_BRANCH = checkoutVars.GIT_BRANCH
                    env.GIT_COMMIT = checkoutVars.GIT_COMMIT
                }
            }
        }

        // ── 2. Environment guard ───────────────────────────────────────────────
        // Only QA and UAT branches trigger test execution.
        stage('Set Environment Variables') {
            when {
                anyOf { branch 'QA'; branch 'UAT' }
            }
            steps {
                script {
                    switch (env.GIT_BRANCH) {
                        case 'QA':
                            env.TARGET_ENV  = env.qaTargetEnv
                            env.ENV_CONFIG  = 'tests/config/.env.qa'
                            break
                        case 'UAT':
                            env.TARGET_ENV  = env.uatTargetEnv
                            env.ENV_CONFIG  = 'tests/config/.env.uat'
                            break
                    }
                    echo "▶ Target environment : ${env.TARGET_ENV}"
                    echo "▶ Suite              : ${params.SUITE}"
                    echo "▶ Module             : ${params.MODULE}"
                }
            }
        }

        // ── 3. Install dependencies ────────────────────────────────────────────
        stage('Install Dependencies') {
            when {
                anyOf { branch 'QA'; branch 'UAT' }
            }
            steps {
                nodejs(NODE_VERSION) {
                    sh 'npm ci'
                    // Install Playwright browsers (Chromium only; skip heavy downloads)
                    sh 'npx playwright install chromium --with-deps'
                }
            }
        }

        // ── 4. Resolve Cucumber tags ───────────────────────────────────────────
        // Builds the --tags expression from SUITE + MODULE parameters.
        // Smoke always requires @smoke; regression excludes @wip.
        // Module adds an AND condition on top of the suite filter.
        stage('Resolve Test Tags') {
            when {
                anyOf { branch 'QA'; branch 'UAT' }
            }
            steps {
                script {
                    // Suite tag
                    def suiteTag = params.SUITE == 'smoke' ? '@smoke' : '@regression'

                    // Module → Cucumber tag mapping
                    def moduleTagMap = [
                        'all'                 : '',
                        'inventory'           : '@inventory',
                        'lighthouse'          : '@lighthouse',
                        'healthcheck'         : '@Healthcheck',
                        'filters'             : '@filters',
                        'inventory-management': '@InventoryManagement',
                        'v6'                  : '@V6',
                        'v7'                  : '@V7',
                        'powersports'         : '@powersports',
                        'marine'              : '@marine',
                        'rv'                  : '@rv',
                        'parts'               : '@parts',
                        'login'               : '@ui',
                        'api'                 : '@dealerspike',
                        'performance'         : '@lighthouse'
                    ]

                    def moduleTag = moduleTagMap[params.MODULE] ?: ''

                    // Combine: suite AND module (when module is not "all")
                    if (moduleTag) {
                        env.CUCUMBER_TAGS = "${suiteTag} and ${moduleTag}"
                    } else {
                        env.CUCUMBER_TAGS = suiteTag
                    }

                    echo "▶ Cucumber tags expression: ${env.CUCUMBER_TAGS}"
                }
            }
        }

        // ── 5. Run Smoke Suite ─────────────────────────────────────────────────
        stage('Run Smoke Tests') {
            when {
                allOf {
                    anyOf { branch 'QA'; branch 'UAT' }
                    expression { params.SUITE == 'smoke' }
                }
            }
            steps {
                nodejs(NODE_VERSION) {
                    sh """
                        set -e
                        mkdir -p ${REPORT_DIR} ${HTML_REPORT_DIR} ${TEST_RESULTS_DIR}
                        npx cucumber-js \\
                            --require tests/steps \\
                            --require Setup/hooks.js \\
                            --tags "${env.CUCUMBER_TAGS}" \\
                            --format progress \\
                            --format json:${REPORT_DIR}/smoke-report.json \\
                            --format html:${HTML_REPORT_DIR}/smoke-report.html \\
                            --exit
                    """
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${HTML_REPORT_DIR}/smoke-report.html", allowEmptyArchive: true
                    archiveArtifacts artifacts: "${TEST_RESULTS_DIR}/**/*",              allowEmptyArchive: true
                }
            }
        }

        // ── 6. Run Regression Suite ────────────────────────────────────────────
        stage('Run Regression Tests') {
            when {
                allOf {
                    anyOf { branch 'QA'; branch 'UAT' }
                    expression { params.SUITE == 'regression' }
                }
            }
            steps {
                nodejs(NODE_VERSION) {
                    sh """
                        set -e
                        mkdir -p ${REPORT_DIR} ${HTML_REPORT_DIR} ${TEST_RESULTS_DIR}
                        npx cucumber-js \\
                            --require tests/steps \\
                            --require Setup/hooks.js \\
                            --tags "${env.CUCUMBER_TAGS}" \\
                            --format progress \\
                            --format json:${REPORT_DIR}/regression-report.json \\
                            --format html:${HTML_REPORT_DIR}/regression-report.html \\
                            --exit
                    """
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${HTML_REPORT_DIR}/regression-report.html", allowEmptyArchive: true
                    archiveArtifacts artifacts: "${TEST_RESULTS_DIR}/**/*",                  allowEmptyArchive: true
                    archiveArtifacts artifacts: "${TEST_RESULTS_DIR}/lighthouse/**/*",        allowEmptyArchive: true
                    archiveArtifacts artifacts: "${TEST_RESULTS_DIR}/inventory-link-validation-report.html", allowEmptyArchive: true
                }
            }
        }

        // ── 7. Generate Allure Report ──────────────────────────────────────────
        stage('Generate Allure Report') {
            when {
                anyOf { branch 'QA'; branch 'UAT' }
            }
            steps {
                script {
                    // Use allure-commandline if Java is available; fall back gracefully
                    def javaAvailable = sh(script: 'java -version 2>/dev/null && echo yes || echo no', returnStdout: true).trim()
                    if (javaAvailable == 'yes') {
                        sh "npx allure generate ${REPORT_DIR} --clean -o allure-report"
                        publishHTML(target: [
                            allowMissing         : true,
                            alwaysLinkToLastBuild: true,
                            keepAll              : true,
                            reportDir            : 'allure-report',
                            reportFiles          : 'index.html',
                            reportName           : "Allure Report – ${params.SUITE} / ${params.MODULE} [${env.TARGET_ENV}]"
                        ])
                    } else {
                        echo 'Java not found — skipping Allure generation. HTML reports are archived instead.'
                    }
                }
            }
        }

    }

    // ── Post ───────────────────────────────────────────────────────────────────
    post {
        always {
            // Archive all JSON result files for downstream processing
            archiveArtifacts artifacts: "${REPORT_DIR}/*.json", allowEmptyArchive: true
        }
        success {
            echo "✅ ${params.SUITE.toUpperCase()} suite / module [${params.MODULE}] PASSED on ${env.TARGET_ENV}"
        }
        failure {
            echo "❌ ${params.SUITE.toUpperCase()} suite / module [${params.MODULE}] FAILED on ${env.TARGET_ENV}"
            // Add emailext / Slack notification here if needed
        }
        unstable {
            echo "⚠️  ${params.SUITE.toUpperCase()} suite / module [${params.MODULE}] is UNSTABLE on ${env.TARGET_ENV}"
        }
    }
}
