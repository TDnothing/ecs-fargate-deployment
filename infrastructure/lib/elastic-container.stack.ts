import {IVpc, Peer, Port, SecurityGroup} from "aws-cdk-lib/aws-ec2";
import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {IRepository} from "aws-cdk-lib/aws-ecr";
import {
    Cluster, ContainerDefinition,
    CpuArchitecture,
    EcrImage,
    FargateService,
    FargateTaskDefinition,
    OperatingSystemFamily
} from "aws-cdk-lib/aws-ecs";
import {
    ApplicationLoadBalancer,
    ApplicationProtocol,
    ApplicationProtocolVersion,
    NetworkLoadBalancer,
    ListenerAction,
    SslPolicy
} from "aws-cdk-lib/aws-elasticloadbalancingv2";


interface Props extends StackProps {
    vpc: IVpc
    repository: IRepository
}

const CONTAINER_PORT = 8081

export class ElasticContainerStack extends Stack {
    public readonly loadBalancer: ApplicationLoadBalancer
    public readonly container: ContainerDefinition
    public readonly service: FargateService
    public readonly cluster: Cluster

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props)
        this.cluster = new Cluster(this, "prologue-cluster", {
            vpc: props.vpc,
            clusterName: "prologue-cluster",
            containerInsights: true,
        })

        const albSg = new SecurityGroup(this, "security-group-load-balancer", {
            vpc: props.vpc,
            allowAllOutbound: true,
        })

        this.loadBalancer = new ApplicationLoadBalancer(this, "prologue-alb", {
            vpc: props.vpc,
            loadBalancerName: "prologue-ecs-alb",
            internetFacing: true,
            idleTimeout: Duration.minutes(10),
            securityGroup: albSg,
            http2Enabled: false,
            deletionProtection: false,
        })

        const httpListener = this.loadBalancer.addListener("http listener", {
            port: CONTAINER_PORT,
            open: true,
            protocol: ApplicationProtocol.HTTP
        })

        const targetGroup = httpListener.addTargets("tcp-listener-target", {
            targetGroupName: "tcp-target-ecs-service",
            protocol: ApplicationProtocol.HTTP,
            protocolVersion: ApplicationProtocolVersion.HTTP1,
        })

        const taskDefinition = new FargateTaskDefinition(
            this,
            "fargate-task-definition",
            {
                runtimePlatform: {
                    cpuArchitecture: CpuArchitecture.ARM64,
                    operatingSystemFamily: OperatingSystemFamily.LINUX,
                },
            }
        )
        this.container = taskDefinition.addContainer("web-server", {
            image: EcrImage.fromEcrRepository(props.repository),
        })
        this.container.addPortMappings({
            containerPort: CONTAINER_PORT,
        })


        const securityGroup = new SecurityGroup(this, "http-sg", {
            vpc: props.vpc,
        })
        securityGroup.addIngressRule(
            Peer.securityGroupId(albSg.securityGroupId),
            Port.tcp(CONTAINER_PORT),
            "Allow inbound connections from ALB"
        )
        this.service = new FargateService(this, "fargate-service", {
            cluster: this.cluster,
            assignPublicIp: false,
            taskDefinition,
            securityGroups: [securityGroup],
            desiredCount: 1,
            minHealthyPercent: 0,
            maxHealthyPercent: 100
        })

        targetGroup.addTarget(this.service)


    }
}
