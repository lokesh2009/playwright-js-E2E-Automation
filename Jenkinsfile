#!/usr/bin/env groovy
/* groovylint-disable CompileStatic */
pipeline {
    agent {
        node {
            label 'linux'
        }
    }

    // ── Parameters ─────────────────────────────────────────────────────────────
    parameters {
        choice(
            name: 'SUITE',
            choices: ['smoke', 'regression'],
            description: 'Test suite: smoke (critical path) or regression (full)'
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
            description: 'Module to target via Cucumber tag. "all" runs every scenario in the chosen suite.'
        )
    }

    // ── Environment ────────────────────────────────────────────────────────────
    environment {
        QA_ENV           = 'QA'
        UAT_ENV          = 'UAT'
        NODE_VERSION     = 'nodejs18x'
        REPORT_DIR       = 'allure-results'
        HTML_REPORT_DIR  = 'reports'
        TEST_RESULTS_DIR = 'tests/test-results'
        ASSEMBLY_VERSION = "1.0.${env.BUILD_NUMBER}"
    }

    options {
        skipDefaultCheckout(true)
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 2, unit: 'HOURS')
    }

    // ── Stages ─────────────────────────────────────────────────────────────────
    stages {

        // 1. Checkout ──────────────────────────────────────────────────────────
        stage('Clean Workspace and Checkout Code') {
            steps {
                cleanWs()
                script {
                    Map checkoutVars = checkout scm
                    env.GIT_URL    = checkoutVars.GIT_URL
                    env.GIT_BRANCH = checkoutVars.GIT_BRANCH
                    env.GIT_COMMIT = checkoutVars.GIT_COMMIT
                }
            }
        }

        // 2. Set environment variables (QA / UAT only) ─────────────────────────
        stage('Set Environment Variables') {
            when { anyOf { branch 'QA'; branch 'UAT' } }
            steps {
                script {
                    if (env.GIT_BRANCH == 'QA') {
                        env.TARGET_ENV = env.QA_ENV
                        env.ENV_CONFIG = 'tests/config/.env.qa'
                    } else {
                        env.TARGET_ENV = env.UAT_ENV
                        env.ENV_CONFIG = 'tests/config/.env.uat'
                    }
                    echo "Target environment : ${env.TARGET_ENV}"
                    echo "Suite              : ${params.SUITE}"
                    echo "Module             : ${params.MODULE}"
                }
            }
        }

        // 3. Install Node dependencies + Playwright browser ────────────────────
        stage('Install Dependencies') {
            when { anyOf { branch 'QA'; branch 'UAT' } }
            steps {
                nodejs(NODE_VERSION) {
                    sh 'npm ci'
                    sh 'npx playwright install chromium --with-deps'
                }
            }
        }

        // 4. Resolve Cucumber --tags expression ────────────────────────────────
        stage('Resolve Test Tags') {
            when { anyOf { branch 'QA'; branch 'UAT' } }
            steps {
                script {
                    String suiteTag = (params.SUITE == 'smoke') ? '@smoke' : '@regression'

                    Map moduleTagMap = [
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

                    String moduleTag = moduleTagMap[params.MODULE] ?: ''

                    env.CUCUMBER_TAGS = moduleTag
                        ? "${suiteTag} and ${moduleTag}"
                        : suiteTag

                    echo "Cucumber tags expression: ${env.CUCUMBER_TAGS}"
                }
            }
        }

        // 5. Smoke Suite ───────────────────────────────────────────────────────
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
                            --format html:${HTML_REPORT_DIR}/smoke-report.html \\
                            --format allure-cucumberjs/reporter \\
                            --format-options '{"resultsDir":"${REPORT_DIR}"}' \\
                            --exit
                    """
                }
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: "${HTML_REPORT_DIR}/smoke-report.html",
                        allowEmptyArchive: true
                    )
                    archiveArtifacts(
                        artifacts: "${TEST_RESULTS_DIR}/**/*",
                        allowEmptyArchive: true
                    )
                }
            }
        }

        // 6. Regression Suite ──────────────────────────────────────────────────
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
                            --format html:${HTML_REPORT_DIR}/regression-report.html \\
                            --format allure-cucumberjs/reporter \\
                            --format-options '{"resultsDir":"${REPORT_DIR}"}' \\
                            --exit
                    """
                }
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: "${HTML_REPORT_DIR}/regression-report.html",
                        allowEmptyArchive: true
                    )
                    archiveArtifacts(
                        artifacts: "${TEST_RESULTS_DIR}/**/*",
                        allowEmptyArchive: true
                    )
                    archiveArtifacts(
                        artifacts: "${TEST_RESULTS_DIR}/lighthouse/**/*",
                        allowEmptyArchive: true
                    )
                    archiveArtifacts(
                        artifacts: "${TEST_RESULTS_DIR}/inventory-link-validation-report.html",
                        allowEmptyArchive: true
                    )
                }
            }
        }

        // 7. Generate Allure Report ────────────────────────────────────────────
        // allure-cucumberjs writes one JSON file per scenario into allure-results/.
        // `allure generate` converts those into a full interactive HTML report.
        stage('Generate Allure Report') {
            when { anyOf { branch 'QA'; branch 'UAT' } }
            steps {
                script {
                    String javaCheck = sh(
                        script: 'java -version > /dev/null 2>&1 && echo yes || echo no',
                        returnStdout: true
                    ).trim()
                    if (javaCheck == 'yes') {
                        // --clean removes the previous allure-report before regenerating
                        sh """
                            npx allure generate ${REPORT_DIR} --clean -o allure-report
                            echo "Allure report generated at allure-report/index.html"
                        """
                        publishHTML(target: [
                            allowMissing         : true,
                            alwaysLinkToLastBuild: true,
                            keepAll              : true,
                            reportDir            : 'allure-report',
                            reportFiles          : 'index.html',
                            reportName           : "Allure – ${params.SUITE}/${params.MODULE} [${env.TARGET_ENV}]"
                        ])
                        archiveArtifacts(artifacts: 'allure-report/**', allowEmptyArchive: true)
                    } else {
                        echo 'Java not available on agent — skipping Allure; HTML reports are archived instead.'
                    }
                }
            }
        }

    }

    // ── Post ───────────────────────────────────────────────────────────────────
    post {
        always {
            archiveArtifacts(artifacts: "${REPORT_DIR}/*.json", allowEmptyArchive: true)
        }
        success {
            echo "PASSED: ${params.SUITE} / ${params.MODULE} on ${env.TARGET_ENV}"
        }
        failure {
            echo "FAILED: ${params.SUITE} / ${params.MODULE} on ${env.TARGET_ENV}"
        }
        unstable {
            echo "UNSTABLE: ${params.SUITE} / ${params.MODULE} on ${env.TARGET_ENV}"
        }
    }
}
