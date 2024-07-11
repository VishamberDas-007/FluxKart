import { Request, Response } from "express";
import {
	CONTACT_E_0001,
	CONTACT_S_0001,
	CONTACT_S_0002,
} from "../config/responseCode/contact";
import prisma from "../db";
import { TContactIdentifyResult, TContactResultWithSet } from "./types/contact";
import { Contact } from "@prisma/client";
import { addUniqueToSet } from "../utils/helper";

export const identifyContact = async (req: Request, res: Response) => {
	try {
		const { email, phoneNumber }: { email?: string; phoneNumber?: number } =
			req.body;

		const emailLowerCase = email?.toLowerCase();
		let emailMatchData: Contact | undefined,
			phoneNumberMatchData: Contact | undefined;
		const obj: TContactResultWithSet = {
			contact: {
				emails: new Set<string>(),
				phoneNumbers: new Set<string>(),
				primaryContactId: 0,
				secondaryContactIds: new Set<number>(),
			},
		};

		if (emailLowerCase) {
			emailMatchData = await prisma.contact.findFirst({
				where: {
					email: emailLowerCase,
				},
			});
		}
		if (phoneNumber) {
			phoneNumberMatchData = await prisma.contact.findFirst({
				where: {
					phoneNumber: phoneNumber.toString(),
				},
			});
		}

		if (!emailMatchData && !phoneNumberMatchData) {
			// if both email and phone number are not present, create a new contact
			await prisma.contact.create({
				data: {
					email: emailLowerCase,
					phoneNumber: phoneNumber?.toString(),
					linkPrecedence: "primary",
				},
			});
		} else if (
			(emailLowerCase && !emailMatchData) ||
			(phoneNumber && !phoneNumberMatchData)
		) {
			// if either email or phone number is present in request and do not match to any existing db record, create a new contact
			await prisma.contact.create({
				data: {
					email: emailLowerCase,
					phoneNumber: phoneNumber?.toString(),
					linkPrecedence: "secondary",
					linkedId:
						emailMatchData?.linkPrecedence === "primary"
							? emailMatchData.id
							: phoneNumberMatchData.id,
				},
			});
		} else if (
			emailMatchData &&
			phoneNumberMatchData &&
			emailMatchData.id !== phoneNumberMatchData.id
		) {
			// if both email and phone number match to different existing db records, update the linkPrecedence and linkedId of the existing record
			await prisma.$transaction(async (prisma) => {
				await prisma.contact.update({
					where: {
						id: emailMatchData.id,
					},
					data: {
						linkPrecedence: "primary",
						linkedId: null,
					},
				});

				await prisma.contact.update({
					where: {
						id: phoneNumberMatchData.id,
					},
					data: {
						linkPrecedence: "secondary",
						linkedId: emailMatchData.id,
					},
				});
			});
		}

		const contactData = await prisma.contact.findFirst({
			where: {
				OR: [
					{
						email: emailLowerCase,
					},
					{
						phoneNumber: phoneNumber?.toString(),
					},
				],
			},
			include: {
				children: true,
				parent: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		// add parent first in the list
		if (contactData.parent) {
			obj.contact.primaryContactId = contactData.parent.id;
			addUniqueToSet(obj.contact.emails, contactData.parent.email);
			addUniqueToSet(obj.contact.phoneNumbers, contactData.parent.phoneNumber);
		}

		if (contactData.linkPrecedence === "primary") {
			obj.contact.primaryContactId = contactData.id;
		} else {
			addUniqueToSet(obj.contact.secondaryContactIds, contactData.id);
		}
		addUniqueToSet(obj.contact.emails, contactData.email);
		addUniqueToSet(obj.contact.phoneNumbers, contactData.phoneNumber);

		// add children in the list
		contactData.children.forEach((element) => {
			addUniqueToSet(obj.contact.secondaryContactIds, element.id);
			addUniqueToSet(obj.contact.emails, element.email);
			addUniqueToSet(obj.contact.phoneNumbers, element.phoneNumber);
		});

		// convert set to array and return the result
		const result: TContactIdentifyResult = {
			contact: {
				emails: Array.from(obj.contact.emails),
				phoneNumbers: Array.from(obj.contact.phoneNumbers),
				primaryContactId: obj.contact.primaryContactId,
				secondaryContactIds: Array.from(obj.contact.secondaryContactIds),
			},
		};

		return res.status(CONTACT_S_0001.statusCode).json({
			...CONTACT_S_0001,
			data: result,
		});
	} catch (error) {
		throw new Error("Error occured while identifyng the contact");
	}
};
