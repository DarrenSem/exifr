import {AppSegmentParserBase} from '../parser.js'
import {segmentParsers} from '../plugins.js'


// TODO: modify AppSegmentParserBase to accept not only buffers,
//       XMP is usually string and we're converting it to buffer to be passed to AppSegmentParserBase
//       and this Xmp parser then converts it back to string.

//<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="XMP Core 5.6.0"></x>
// XMPToolkit
export default class Xmp extends AppSegmentParserBase {

	static type = 'xmp'

	static canHandle(buffer, offset) {
		return buffer.getUint8(offset + 1) === 0xE1
			&& buffer.getUint32(offset + 4) === 0x68747470 // 'http'
	}

	// warning: XMP can start with the http. the content may or may not be wrapped into <?xpacket.
	// So far i've seen all of these:
	// '<?xpacket><x:xmpmeta><rdf:RDF>'
	// '<?xpacket><rdf:RDF>'
	// '<x:xmpmeta><rdf:RDF>'
	// 'http://ns.adobe.com/xap/1.0/ <?xpacket>'
	// 'http://ns.adobe.com/xap/1.0/ <x:xmpmeta>'

	parse() {
		// Read XMP segment as string. We're not parsing the XML.
		let string = this.chunk.getString()
		// Trim the mess around.
		let start = string.indexOf('<')
		let end = string.lastIndexOf('>') + 1
		string = string.slice(start, end).trim()
		if (string.startsWith('<?xpacket')) {
			start = string.indexOf('>') + 1
			end = string.lastIndexOf('<?xpacket')
			string = string.slice(start, end).trim()
		}
		// Parse XML if the user provided his own XMP parser.
		if (this.parseXml)
			return this.parseXml(string)
		else
			return string
	}

	//parseXml() {}

}

segmentParsers.set('xmp', Xmp)