
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

<xsl:output method="xml" indent="yes"/>

<xsl:template match="/root">
    <xs:schema>
        <xsl:apply-templates select="node()"/>

        <xs:element name="book-root">
            <xs:annotation><xs:documentation>A dummy container for the root of the book</xs:documentation></xs:annotation>    
            <xs:complexType>
                <xs:sequence>
                    <xs:element name="vars">
                        <xs:annotation><xs:documentation>All of the variables that are used in the book need to be defined here</xs:documentation></xs:annotation>    
                        <xs:complexType>
                            <xs:choice minOccurs="1" maxOccurs="unbounded">
                                <xs:element name="var">
                                    <xs:annotation><xs:documentation>The id is used in curly braces inside shape/component definitions and are replaced with this value</xs:documentation></xs:annotation>    
                                    <xs:complexType>
                                        <xs:attribute name="id" use="required" type="xs:string"/>
                                        <xs:attribute name="value" use="required" type="xs:string"/>
                                    </xs:complexType>
                                </xs:element>
                            </xs:choice>
                        </xs:complexType>
                    </xs:element>
                    <xs:element name="shapes">
                        <xs:annotation><xs:documentation>All of the instances of shapes that are used in the book need to be defined here</xs:documentation></xs:annotation>    
                        <xs:complexType>
                            <xs:choice minOccurs="1" maxOccurs="unbounded">
                                <xsl:for-each select="shape">
                                    <xs:element ref="{@id}"/>
                                </xsl:for-each>
                            </xs:choice>
                        </xs:complexType>
                    </xs:element>
                </xs:sequence>
            </xs:complexType>
        </xs:element>
    </xs:schema>
</xsl:template>

<xsl:template match="component">
    <!-- <xsl:variable name="name">
        <xsl:choose>
            <xsl:when test="@name"><xsl:value-of select="@name"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="@id"/></xsl:otherwise>
        </xsl:choose>
    </xsl:variable> -->
    <xs:complexType name="{@id}">
        <xsl:apply-templates select="prop|prop-defined"/>
    </xs:complexType>
</xsl:template>

<xsl:template match="shape">
    <xsl:variable name="propsFromRef" select="@props-from-ref"/>
    <xs:element name="{@id}">
        <xs:annotation><xs:documentation >Defined in the design.xml file. Attributes: selector, <xsl:for-each select="/root/component[@id=$propsFromRef]/prop"><xsl:if test="position() != 1"><xsl:text>, </xsl:text></xsl:if><xsl:value-of select="@name"/><xsl:if test="@use='optional'">?</xsl:if>, </xsl:for-each>.</xs:documentation></xs:annotation>    
        <xs:complexType>
            <xs:sequence>
                <xsl:apply-templates select="component-ref"/>
            </xs:sequence>
            <xs:attribute name="selector" use="required" type="xs:string">
                <xs:annotation><xs:documentation>This is the root selector that will match elements in the HTML document</xs:documentation></xs:annotation>
            </xs:attribute>
            <xsl:if test="$propsFromRef">
                <xsl:apply-templates select="/root/component[@id=$propsFromRef]/*"/>
            </xsl:if>
            <xsl:apply-templates select="prop|prop-defined"/>
        </xs:complexType>
    </xs:element>
</xsl:template>

<xsl:template match="prop">
    <xs:attribute name="{@name}">
        <xsl:apply-templates select="@use"/>
        <xsl:attribute name="type">
            <xsl:choose>
                <xsl:when test="starts-with(@type, 'xs:')">
                    <xsl:value-of select="@type"/>
                </xsl:when>
                <!-- HACK: hardcode all other types to be strings -->
                <xsl:otherwise>
                    <xsl:text>xs:string</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:attribute>
        <xs:annotation><xs:documentation><xsl:value-of select="@use"/>. The value needs to be a <xsl:value-of select="@type"/></xs:documentation></xs:annotation>    
    </xs:attribute>
</xsl:template>

<xsl:template match="prop/@use">
    <xsl:copy/>
</xsl:template>

<xsl:template match="component-ref">
    <xsl:variable name="ref" select="@ref"/>
    <xs:element name="{$ref}">
        <xs:annotation><xs:documentation>This is a component. For now it needs to be unique. Attributes: <xsl:for-each select="/root/component[@id=$ref]/prop"><xsl:if test="position() != 1"><xsl:text>, </xsl:text></xsl:if><xsl:value-of select="@name"/><xsl:if test="@use='optional'">?</xsl:if></xsl:for-each>.</xs:documentation></xs:annotation>
        <xs:complexType>
            <xs:complexContent>
                <xs:extension base="{$ref}">
                    <xs:sequence>
                        <xsl:apply-templates select="component-ref"/>
                    </xs:sequence>
                </xs:extension>
            </xs:complexContent>
        </xs:complexType>
    </xs:element>
</xsl:template>


</xsl:stylesheet>