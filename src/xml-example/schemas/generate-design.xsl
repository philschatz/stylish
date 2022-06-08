
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

<xsl:output method="xml" indent="yes"/>

<xsl:template match="/root">
    <xs:schema>
        <xsl:apply-templates select="node()"/>

        <xs:element name="book-root">
            <xs:complexType>
                <xs:choice minOccurs="1" maxOccurs="unbounded">
                    <xsl:for-each select="component|shape">
                        <xs:element ref="{@name}"/>
                    </xsl:for-each>
                </xs:choice>
            </xs:complexType>
        </xs:element>
    </xs:schema>
</xsl:template>

<xsl:template match="component">
    <xs:element name="{@name}">
        <xs:complexType>
            <xsl:apply-templates select="param"/>
        </xs:complexType>
    </xs:element>
</xsl:template>

<xsl:template match="shape">
    <xs:element name="{@name}">
        <xs:complexType>
            <xs:sequence>
                <xsl:apply-templates select="component-ref"/>
            </xs:sequence>
            <xs:attribute name="selector" use="required" type="xs:string"/>
            <xsl:apply-templates select="param"/>
        </xs:complexType>
    </xs:element>
</xsl:template>

<xsl:template match="param">
    <xs:attribute name="{@name}">
        <xsl:if test="@required='true'">
            <xsl:attribute name="use">required</xsl:attribute>
        </xsl:if>
        <xsl:attribute name="type">
            <xsl:choose>
                <xsl:when test="starts-with(@type, 'xs:')">
                    <xsl:value-of select="@type"/>
                </xsl:when>
                <!-- HACK: harrdcode all other types to be strings -->
                <xsl:otherwise>
                    <xsl:text>xs:string</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:attribute>
    </xs:attribute>
</xsl:template>

<xsl:template match="component-ref">
    <xs:element ref="{@ref}"/>
</xsl:template>

</xsl:stylesheet>